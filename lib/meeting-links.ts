/**
 * Meeting Link Generation Module
 * Supports Zoom and Google Meet integration
 */

import { prisma } from "./prisma"

// Generate a simple meeting room link (fallback when no API configured)
export function generateSimpleMeetingLink(bookingId: string): string {
  // Generate a unique room ID based on booking
  const roomId = Buffer.from(bookingId).toString('base64').substring(0, 10).replace(/[+/=]/g, '')
  return `https://meet.flexibook.com/room/${roomId}`
}

// Zoom Integration
export async function generateZoomMeetingLink(booking: {
  id: string
  teacherId: string
  startTime: Date
  endTime: Date
  teacher: { name: string | null; email: string | null }
  student: { name: string | null; email: string | null }
}): Promise<string | null> {
  try {
    const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID
    const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
    const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      console.log("Zoom credentials not configured, using fallback")
      return generateSimpleMeetingLink(booking.id)
    }

    // Get Zoom OAuth token (Server-to-Server OAuth)
    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    )

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Zoom access token")
    }

    const { access_token } = await tokenResponse.json()

    // Create Zoom meeting
    const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: `Flexibook Lesson: ${booking.teacher.name} & ${booking.student.name}`,
        type: 2, // Scheduled meeting
        start_time: booking.startTime.toISOString(),
        duration: Math.ceil((booking.endTime.getTime() - booking.startTime.getTime()) / 60000),
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: false,
          audio: "both",
          auto_recording: "none",
        },
      }),
    })

    if (!meetingResponse.ok) {
      throw new Error("Failed to create Zoom meeting")
    }

    const meetingData = await meetingResponse.json()
    return meetingData.join_url
  } catch (error) {
    console.error("Zoom meeting creation error:", error)
    return generateSimpleMeetingLink(booking.id)
  }
}

// Google Meet Integration
export async function generateGoogleMeetLink(booking: {
  id: string
  teacherId: string
  startTime: Date
  endTime: Date
  teacher: { name: string | null; email: string | null }
  student: { name: string | null; email: string | null }
}): Promise<string | null> {
  try {
    const ENABLE_GOOGLE_MEET = process.env.ENABLE_GOOGLE_MEET === "true"
    
    if (!ENABLE_GOOGLE_MEET) {
      console.log("Google Meet not enabled, using fallback")
      return generateSimpleMeetingLink(booking.id)
    }

    // Get teacher's Google Calendar credentials from database
    const teacher = await prisma.user.findUnique({
      where: { id: booking.teacherId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    })

    if (!teacher?.googleAccessToken) {
      console.log("Teacher hasn't connected Google Calendar, using fallback")
      return generateSimpleMeetingLink(booking.id)
    }

    // Create Google Calendar event with Google Meet link
    const eventResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${teacher.googleAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `Flexibook Lesson: ${booking.student.name}`,
          description: `Language lesson booked through Flexibook\nStudent: ${booking.student.name}\nTeacher: ${booking.teacher.name}`,
          start: {
            dateTime: booking.startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: booking.endTime.toISOString(),
            timeZone: "UTC",
          },
          attendees: [
            { email: booking.teacher.email! },
            { email: booking.student.email! },
          ],
          conferenceData: {
            createRequest: {
              requestId: booking.id,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
      }
    )

    if (!eventResponse.ok) {
      throw new Error("Failed to create Google Meet event")
    }

    const eventData = await eventResponse.json()
    return eventData.conferenceData?.entryPoints?.[0]?.uri || generateSimpleMeetingLink(booking.id)
  } catch (error) {
    console.error("Google Meet creation error:", error)
    return generateSimpleMeetingLink(booking.id)
  }
}

// Main function to generate meeting link
export async function generateMeetingLink(booking: {
  id: string
  teacherId: string
  startTime: Date
  endTime: Date
  teacher: { name: string | null; email: string | null }
  student: { name: string | null; email: string | null }
}): Promise<string> {
  // Priority: 1. Zoom (if configured), 2. Google Meet (if enabled), 3. Simple link
  try {
    // Try Zoom first
    if (process.env.ZOOM_CLIENT_ID) {
      const zoomLink = await generateZoomMeetingLink(booking)
      if (zoomLink) return zoomLink
    }

    // Try Google Meet
    if (process.env.ENABLE_GOOGLE_MEET === "true") {
      const meetLink = await generateGoogleMeetLink(booking)
      if (meetLink) return meetLink
    }

    // Fallback to simple meeting link
    return generateSimpleMeetingLink(booking.id)
  } catch (error) {
    console.error("Meeting link generation error:", error)
    return generateSimpleMeetingLink(booking.id)
  }
}

