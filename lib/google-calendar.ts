/**
 * Google Calendar Integration
 */

import { prisma } from "./prisma"

interface CalendarEvent {
  bookingId: string
  summary: string
  description: string
  startTime: Date
  endTime: Date
  attendees: string[]
}

// Add event to Google Calendar
export async function addToGoogleCalendar(
  userId: string,
  event: CalendarEvent
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true, googleCalendarEnabled: true },
    })

    if (!user?.googleAccessToken || !user.googleCalendarEnabled) {
      console.log("User hasn't enabled Google Calendar sync")
      return null
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: "UTC",
          },
          attendees: event.attendees.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 },
              { method: "popup", minutes: 60 },
            ],
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to create calendar event")
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error("Google Calendar sync error:", error)
    return null
  }
}

// Delete event from Google Calendar
export async function deleteFromGoogleCalendar(
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleCalendarEnabled: true },
    })

    if (!user?.googleAccessToken || !user.googleCalendarEnabled) {
      return false
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`,
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error("Google Calendar delete error:", error)
    return false
  }
}

// OAuth URL for Google Calendar
export function getGoogleCalendarAuthUrl(): string {
  const client_id = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const redirect_uri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`
  
  const params = new URLSearchParams({
    client_id: client_id || "",
    redirect_uri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange code for tokens
export async function exchangeGoogleCalendarCode(code: string): Promise<{
  access_token: string
  refresh_token: string
} | null> {
  try {
    const client_id = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    const client_secret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
    const redirect_uri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: client_id || "",
        client_secret: client_secret || "",
        redirect_uri,
        grant_type: "authorization_code",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens")
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    }
  } catch (error) {
    console.error("Google Calendar code exchange error:", error)
    return null
  }
}

