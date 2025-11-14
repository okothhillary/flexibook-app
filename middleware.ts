// middleware.ts

//once auth is implemented, uncomment the following lines to enable authentication middleware.

// export { default } from "next-auth/middleware";

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/bookings/:path*",
//     "/teachers/profile/:path*",
//   ],
// };

// Just let everything through for now until Samuel implements Auth, only for checking that the dashboard is displaying correctly.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/teachers/profile/:path*",
  ],
};
