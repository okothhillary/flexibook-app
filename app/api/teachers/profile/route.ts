import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { teacherProfileSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            timezone: true,
          },
        },
      },
    })

    return NextResponse.json({ teacher })
  } catch (error) {
    console.error("Error fetching teacher profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = teacherProfileSchema.parse(body)

    const teacher = await prisma.teacher.update({
      where: {
        userId: session.user.id,
      },
      data: {
        ...validatedData,
        isActive: true, // activate once profile is updated
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({ teacher })
  } catch (error: any) {
    console.error("Error updating teacher profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}

