import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, only teachers can access admin stats
    // You can add a separate ADMIN role later
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get statistics
    const [totalUsers, totalBookings, totalPayments, activeTeachers] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.teacher.count({
        where: {
          isActive: true,
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalBookings,
      totalRevenue: totalPayments._sum.amount || 0,
      activeTeachers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}

