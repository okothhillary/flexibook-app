"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Star } from "lucide-react"
import { addDays, format, startOfWeek, addWeeks } from "date-fns"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { getTimeSlots, getDayOfWeek } from "@/lib/time-utils"

const DURATIONS = [20, 45, 60, 90]

export default function BookTeacherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const teacherId = params.id as string

  useEffect(() => {
    if (status === "loading") return

    if (session?.user.role === "TEACHER") {
      router.push("/dashboard")
      return
    }

    fetchTeacher()
  }, [session, status, router])

  useEffect(() => {
    if (selectedDate && teacher) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, teacher])

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`)
      const data = await response.json()
      setTeacher(data.teacher)
    } catch (error) {
      console.error("Failed to fetch teacher:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dayOfWeek = getDayOfWeek(date)
      const availability = teacher.availabilities.find(
        (a: any) => a.dayOfWeek === dayOfWeek && a.isRecurring
      )

      if (availability) {
        const slots = getTimeSlots(availability.startTime, availability.endTime, 15)
        setAvailableSlots(slots)
      } else {
        setAvailableSlots([])
      }
    } catch {
      setAvailableSlots([])
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({ title: "Error", description: "Please select a date and time", variant: "destructive" })
      return
    }

    setBooking(true)

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const startTime = new Date(selectedDate)
      startTime.setHours(hours, minutes, 0, 0)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, startTime: startTime.toISOString(), durationMinutes: duration }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create booking")

      toast({ title: "Success", description: "Booking confirmed successfully! (Mock Payment)" })
      router.push(`/bookings/${data.booking.id}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setBooking(false)
    }
  }

  const getDatesForNextWeeks = (weeks = 4) => {
    const dates = []
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 1 })
    for (let w = 0; w < weeks; w++) {
      const weekStart = addWeeks(start, w)
      for (let d = 0; d < 7; d++) {
        const date = addDays(weekStart, d)
        if (date >= today) dates.push(date)
      }
    }
    return dates.slice(0, 28)
  }

  if (loading || !teacher) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
        </div>
      </div>
    )
  }

  const initials = teacher.user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "T"

  const hourlyRate = teacher.hourlyRate
  const estimatedCost = (hourlyRate / 60) * duration

  return (
    <div className="min-h-screen relative">
      <Navbar />
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 60% 40%, rgba(245,158,11,0.12) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%), linear-gradient(135deg, rgba(252,252,253,0.8) 0%, rgba(255,255,255,0.9) 100%)` }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 85px, rgba(245,158,11,0.02) 85px, rgba(245,158,11,0.02) 170px), repeating-linear-gradient(90deg, transparent, transparent 85px, rgba(168,85,247,0.02) 85px, rgba(168,85,247,0.02) 170px)` }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Book a Lesson</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Choose your preferred date, time, and duration</p>
        </div>

        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-500 flex flex-wrap gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="hover:underline cursor-pointer" onClick={() => router.push("/dashboard?role=student")}>Dashboard</span>
          <span>/</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push("/teachers")}>Teachers</span>
          <span>/</span>
          <span className="font-semibold text-gray-900">Book Lesson</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Teacher Info */}
          <div className="md:col-span-1 backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200/60 h-fit sticky top-20">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-5 mb-6 sm:mb-8">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-gray-100">
                <AvatarImage src={teacher.user.image || undefined} />
                <AvatarFallback className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-gray-800 to-gray-900 text-white">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{teacher.user.name}</h2>
              <p className="text-sm sm:text-base text-gray-600 font-semibold flex items-center gap-2 justify-center">
                <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" /> {teacher.yearsExperience ? `${teacher.yearsExperience} years experience` : "Experienced teacher"}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-2 sm:mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.languages.map((lang: string) => (
                    <span key={lang} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold bg-gray-100 text-gray-800 rounded-full">{lang}</span>
                  ))}
                </div>
              </div>

              {teacher.bio && (
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 sm:mb-3">About</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">{teacher.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-black text-gray-900 mb-1">Hourly Rate</h3>
                <p className="text-3xl sm:text-4xl font-black text-gray-900">{formatCurrency(hourlyRate)}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">per hour</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-2 backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200/60 space-y-6">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-lg sm:text-xl font-black text-gray-900">Lesson Duration</Label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {DURATIONS.map((dur) => {
                  const cost = (hourlyRate / 60) * dur
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`p-2 sm:p-4 rounded-xl border-2 text-center transition-all ${duration === dur ? "border-gray-800 bg-gray-800 text-white shadow-lg" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
                    >
                      <div className="font-black text-sm sm:text-lg">{dur} min</div>
                      <div className={`text-xs sm:text-sm font-semibold ${duration === dur ? "text-white/80" : "text-gray-500"}`}>{formatCurrency(cost)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date selection */}
            <div className="space-y-2">
              <Label className="text-lg sm:text-xl font-black text-gray-900">Select Date</Label>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {getDatesForNextWeeks().map((date) => {
                  const dayOfWeek = getDayOfWeek(date)
                  const hasAvailability = teacher.availabilities.some((a: any) => a.dayOfWeek === dayOfWeek && a.isRecurring)
                  const selected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => hasAvailability && setSelectedDate(date)}
                      disabled={!hasAvailability}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-center text-xs sm:text-sm transition-all ${selected ? "border-gray-800 bg-gray-800 text-white shadow-lg" : hasAvailability ? "border-gray-300 bg-white text-gray-700 hover:border-gray-500" : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                      <div className="font-bold">{format(date, "EEE")}</div>
                      <div className="font-black">{format(date, "d")}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-lg sm:text-xl font-black text-gray-900">Select Time</Label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm sm:text-base text-gray-500">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-1 sm:p-2 rounded-lg border-2 text-xs sm:text-sm font-bold transition-all ${selectedTime === time ? "border-gray-800 bg-gray-800 text-white shadow-lg" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 space-y-2 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-black text-gray-900">Booking Summary</h3>
                <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700"><Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />{format(selectedDate, "PPPP")}</div>
                <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />{selectedTime} • {formatDuration(duration)}</div>
                <div className="flex items-center justify-between pt-2 sm:pt-4 border-t-2 border-gray-300">
                  <span className="text-base sm:text-lg font-black text-gray-900">Total Cost</span>
                  <span className="text-xl sm:text-3xl font-black text-gray-900">{formatCurrency(estimatedCost)}</span>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || booking}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-2xl rounded-2xl h-12 sm:h-14 font-black text-base sm:text-lg transition-all duration-300"
            >
              {booking ? "Processing..." : "Confirm Booking (Mock Payment)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
