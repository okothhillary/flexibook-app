import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { exchangeGoogleCalendarCode } from "@/lib/google-calendar"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/signin`)
    }

    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error || !code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?calendar_error=true`
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeGoogleCalendarCode(code)
    if (!tokens) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?calendar_error=true`
      )
    }

    // Save tokens to user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleCalendarEnabled: true,
      },
    })

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?calendar_connected=true`
    )
  } catch (error) {
    console.error("Google Calendar callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?calendar_error=true`
    )
  }
}

