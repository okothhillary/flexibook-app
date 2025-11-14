import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        teacher: {
          include: {
            user: true,
          },
        },
        student: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    if (booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!booking.payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(booking.payment.amount * 100), // Convert to cents
            product_data: {
              name: `Lesson with ${booking.teacher.user.name}`,
              description: `${booking.durationMinutes} minute lesson on ${booking.startTime.toLocaleDateString()}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: booking.student.email,
      metadata: {
        bookingId: booking.id,
        paymentId: booking.payment.id,
      },
      success_url: `${process.env.NEXTAUTH_URL}/bookings/${bookingId}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/bookings/${bookingId}?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    // Update payment with Stripe payment ID
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        stripePaymentId: checkoutSession.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

