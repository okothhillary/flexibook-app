import { Resend } from "resend"
import { formatInTimeZone } from "date-fns-tz"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingEmailData {
  to: string
  userName: string
  teacherName: string
  startTime: Date
  endTime: Date
  duration: number
  meetingLink?: string
  timezone: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const formattedDate = formatInTimeZone(
      data.startTime,
      data.timezone,
      "PPPP 'at' p"
    )

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@flexibook.com",
      to: data.to,
      subject: "Booking Confirmed - Flexibook",
      html: `
        <h2>Your lesson has been confirmed!</h2>
        <p>Hi ${data.userName},</p>
        <p>Your lesson with ${data.teacherName} has been confirmed.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Duration:</strong> ${data.duration} minutes</li>
          ${data.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ""}
        </ul>
        
        <p>We'll send you a reminder before your lesson starts.</p>
        <p>Best regards,<br/>The Flexibook Team</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send confirmation email:", error)
    throw error
  }
}

export async function sendBookingReminder(data: BookingEmailData, hoursBeforethe: number) {
  try {
    const formattedDate = formatInTimeZone(
      data.startTime,
      data.timezone,
      "PPPP 'at' p"
    )

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@flexibook.com",
      to: data.to,
      subject: `Reminder: Lesson in ${hoursBeforethe} hour${hoursBeforethe > 1 ? "s" : ""}`,
      html: `
        <h2>Your lesson is coming up soon!</h2>
        <p>Hi ${data.userName},</p>
        <p>This is a reminder that your lesson with ${data.teacherName} starts in ${hoursBeforethe} hour${hoursBeforethe > 1 ? "s" : ""}.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Duration:</strong> ${data.duration} minutes</li>
          ${data.meetingLink ? `<li><strong>Join Meeting:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ""}
        </ul>
        
        <p>See you soon!<br/>The Flexibook Team</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send reminder email:", error)
    throw error
  }
}

export async function sendCancellationEmail(data: BookingEmailData, reason?: string) {
  try {
    const formattedDate = formatInTimeZone(
      data.startTime,
      data.timezone,
      "PPPP 'at' p"
    )

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@flexibook.com",
      to: data.to,
      subject: "Booking Cancelled - Flexibook",
      html: `
        <h2>Booking Cancellation</h2>
        <p>Hi ${data.userName},</p>
        <p>Your lesson with ${data.teacherName} scheduled for ${formattedDate} has been cancelled.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        
        <p>If a payment was made, you'll receive a refund according to our cancellation policy.</p>
        <p>Best regards,<br/>The Flexibook Team</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send cancellation email:", error)
    throw error
  }
}

interface RescheduleEmailData {
  studentName: string
  teacherName: string
  startTime: string
  durationMinutes: number
  studentEmail: string
  teacherEmail: string
  meetingLink?: string
}

export async function sendRescheduleEmail(data: RescheduleEmailData, reason: string) {
  try {
    const startDate = new Date(data.startTime)
    const formattedDate = formatInTimeZone(
      startDate,
      "UTC",
      "PPPP 'at' p"
    )

    // Send to student
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@flexibook.com",
      to: data.studentEmail,
      subject: "Booking Rescheduled - Flexibook",
      html: `
        <h2>Your lesson has been rescheduled</h2>
        <p>Hi ${data.studentName},</p>
        <p>Your lesson with ${data.teacherName} has been rescheduled.</p>
        
        <h3>New Schedule:</h3>
        <ul>
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Duration:</strong> ${data.durationMinutes} minutes</li>
          ${data.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ""}
        </ul>
        
        <p><strong>Reason for rescheduling:</strong> ${reason}</p>
        
        <p>Best regards,<br/>The Flexibook Team</p>
      `,
    })

    // Send to teacher
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@flexibook.com",
      to: data.teacherEmail,
      subject: "Booking Rescheduled - Flexibook",
      html: `
        <h2>A lesson has been rescheduled</h2>
        <p>Hi ${data.teacherName},</p>
        <p>Your lesson with ${data.studentName} has been rescheduled.</p>
        
        <h3>New Schedule:</h3>
        <ul>
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Duration:</strong> ${data.durationMinutes} minutes</li>
        </ul>
        
        <p><strong>Reason for rescheduling:</strong> ${reason}</p>
        
        <p>Best regards,<br/>The Flexibook Team</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send reschedule email:", error)
    throw error
  }
}

