import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authUrl = getGoogleCalendarAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Google Calendar connect error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Google Calendar connection" },
      { status: 500 }
    )
  }
}

