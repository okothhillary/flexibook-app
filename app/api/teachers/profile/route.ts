import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { teacherProfileSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json({ teacher })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = teacherProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 })
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { userId: session.user.id },
      data: validation.data,
    })

    return NextResponse.json({ teacher: updatedTeacher })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
