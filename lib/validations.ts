import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TEACHER"]),
  timezone: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const teacherProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  hourlyRate: z.number().min(5, "Hourly rate must be at least $5").max(500),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  yearsExperience: z.number().min(0).max(50).optional(),
  bufferTime: z.number().min(0).max(60).optional(),
  isActive: z.boolean().optional(),
})

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  date: z.string().datetime().optional(),
  isRecurring: z.boolean().default(true),
})

export const bookingSchema = z.object({
  teacherId: z.string(),
  startTime: z.string().datetime(),
  durationMinutes: z.number().min(20).max(180),
  notes: z.string().max(500).optional(),
})

export const cancelBookingSchema = z.object({
  bookingId: z.string(),
  reason: z.string().min(10, "Please provide a reason for cancellation"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>

