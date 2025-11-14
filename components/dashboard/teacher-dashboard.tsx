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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Teacher Dashboard</h1>
        <p className="text-lg text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Manage your teaching schedule</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-violet-50/90 via-white/80 to-fuchsia-50/90 rounded-3xl shadow-xl p-8 border border-violet-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-wider text-violet-600 mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>Total Students</div>
            <div className="text-5xl font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
              {new Set(bookings.map((b) => b.studentId)).size}
            </div>
          </div>
        </div>

        <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-50/90 via-white/80 to-orange-50/90 rounded-3xl shadow-xl p-8 border border-amber-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-wider text-amber-600 mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>Upcoming Sessions</div>
            <div className="text-5xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>{upcomingBookings.length}</div>
          </div>
        </div>

        <div className="relative backdrop-blur-xl bg-gradient-to-br from-green-50/90 via-white/80 to-emerald-50/90 rounded-3xl shadow-xl p-8 border border-green-200/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-wider text-green-600 mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>Total Earnings</div>
            <div className="text-5xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>{formatCurrency(totalEarnings)}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200/60">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Upcoming Sessions</h3>
            <p className="text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Your next scheduled lessons</p>
          </div>
          <div>
            {loading ? (
              <p className="text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-6 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>No upcoming sessions</p>
                <Link href="/teachers/availability">
                  <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl shadow-gray-400/30 rounded-xl px-8 font-black transition-all duration-300" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>Set Your Availability</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>{booking.student.name}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.startTime), "PPP")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <Clock className="w-4 h-4" />
                        {format(new Date(booking.startTime), "p")} •{" "}
                        {formatDuration(booking.durationMinutes)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(booking.payment?.amount || 0)}
                      </div>
                    </div>
                    <Link href={`/bookings/${booking.id}`}>
                      <Button size="sm" className="border-2 border-gray-300 hover:border-gray-500 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-black" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200/60">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Quick Actions</h3>
            <p className="text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Manage your teaching profile</p>
          </div>
          <div className="space-y-4">
            <Link href="/teachers/profile" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-6 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                <Settings className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/teachers/availability" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-6 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                <Calendar className="w-5 h-5 mr-2" />
                Manage Availability
              </Button>
            </Link>
            <Link href="/bookings" className="block">
              <Button className="w-full border-2 border-gray-300 hover:border-gray-500 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-900 rounded-2xl py-6 font-black text-base transition-all duration-300 shadow-lg hover:shadow-xl" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
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

