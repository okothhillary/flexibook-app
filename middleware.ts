export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/bookings/:path*", "/teachers/profile/:path*"],
}

