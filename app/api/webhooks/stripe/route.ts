import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { generateMeetingLink } from "@/lib/meeting-links"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { bookingId, paymentId } = session.metadata || {}

        if (!bookingId || !paymentId) {
          console.error("Missing metadata in webhook")
          break
        }

        // Update payment status
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent as string,
          },
        })

        // Get full booking details for meeting link generation
        const fullBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            teacher: { select: { name: true, email: true, userId: true } },
            student: { select: { name: true, email: true } },
          },
        })

        // Generate meeting link
        let meetingLink: string | undefined
        if (fullBooking) {
          try {
            meetingLink = await generateMeetingLink({
              id: fullBooking.id,
              teacherId: fullBooking.teacherId,
              startTime: fullBooking.startTime,
              endTime: fullBooking.endTime,
              teacher: fullBooking.teacher,
              student: fullBooking.student,
            })
          } catch (error) {
            console.error("Failed to generate meeting link:", error)
          }
        }

        // Update booking status with meeting link
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            meetingLink,
          },
        })

        // Create notifications
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        })

        if (booking) {
          const reminderTimes = [
            { hours: 24, type: "REMINDER_24H" as const },
            { hours: 1, type: "REMINDER_1H" as const },
          ]

          for (const { hours, type } of reminderTimes) {
            const scheduledAt = new Date(booking.startTime)
            scheduledAt.setHours(scheduledAt.getHours() - hours)

            await prisma.notification.create({
              data: {
                bookingId: booking.id,
                type,
                scheduledAt,
              },
            })
          }

          // Immediate confirmation notification
          await prisma.notification.create({
            data: {
              bookingId: booking.id,
              type: "BOOKING_CONFIRMED",
              scheduledAt: new Date(),
            },
          })
        }

        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        const { bookingId } = session.metadata || {}

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CANCELLED",
              cancelReason: "Payment session expired",
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

