"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, Settings } from "lucide-react"
import { format } from "date-fns"
import { formatCurrency, formatDuration } from "@/lib/utils"

export function TeacherDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings?status=CONFIRMED")
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings
    .filter((b) => new Date(b.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3)

  const totalEarnings = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((acc, b) => acc + (b.payment?.amount || 0), 0)

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-8 lg:px-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1 sm:mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Manage your teaching schedule
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
        {/* Total Students */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-violet-50/90 via-white/80 to-fuchsia-50/90 rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-violet-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-violet-600 mb-2 sm:mb-3">
              Total Students
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {new Set(bookings.map((b) => b.studentId)).size}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-50/90 via-white/80 to-orange-50/90 rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-amber-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-600 mb-2 sm:mb-3">
              Upcoming Sessions
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {upcomingBookings.length}
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-green-50/90 via-white/80 to-emerald-50/90 rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-green-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-green-600 mb-2 sm:mb-3">
              Total Earnings
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(totalEarnings)}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-6">
        {/* Upcoming Sessions */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200/60">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">Upcoming Sessions</h3>
            <p className="text-sm sm:text-base text-gray-600">Your next scheduled lessons</p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <p className="text-gray-500 mb-4 sm:mb-6 font-semibold">No upcoming sessions</p>
                <Link href="/teachers/availability">
                  <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl shadow-gray-400/30 rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-black transition-all duration-300">
                    Set Your Availability
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{booking.student.name}</div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.startTime), "PPP")}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {format(new Date(booking.startTime), "p")} • {formatDuration(booking.durationMinutes)}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(booking.payment?.amount || 0)}
                      </div>
                    </div>
                    <Link href={`/bookings/${booking.id}`} className="mt-2 sm:mt-0">
                      <Button size="sm" className="border-2 border-gray-300 hover:border-gray-500 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-black">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200/60">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">Quick Actions</h3>
            <p className="text-sm sm:text-base text-gray-600">Manage your teaching profile</p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <Link href="/teachers/profile" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-3 sm:py-4 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl">
                <Settings className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/teachers/availability" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-3 sm:py-4 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl">
                <Calendar className="w-5 h-5 mr-2" />
                Manage Availability
              </Button>
            </Link>
            <Link href="/bookings" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-3 sm:py-4 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl">
                <Clock className="w-5 h-5 mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
