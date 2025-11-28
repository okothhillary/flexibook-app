"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING_PAYMENT: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Payment" },
  CONFIRMED: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
  COMPLETED: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  REFUNDED: { bg: "bg-gray-100", text: "text-gray-800", label: "Refunded" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    try {
      const url = filter === "all" ? "/api/bookings" : `/api/bookings?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally { setLoading(false); }
  };

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending Payment", value: "PENDING_PAYMENT" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            My Bookings
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                className={`h-10 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  filter === f.value
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
                    : "border-2 border-gray-300 hover:border-gray-500 bg-white hover:bg-gray-50 text-gray-700"
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>No bookings found</p>
            <Link href="/teachers">
              <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg rounded-xl px-8 py-3 sm:px-10 sm:py-3 font-bold text-base transition-all duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
                Find a Teacher
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING_PAYMENT;
              return (
                <div
                  key={booking.id}
                  className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-lg border border-gray-200/60 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mb-4 md:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {booking.teacher.name}
                      </h3>
                      <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-right text-lg sm:text-2xl font-black text-gray-900">
                      {formatCurrency(booking.payment?.amount || 0)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-end">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-base text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{format(new Date(booking.startTime), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{format(new Date(booking.startTime), "p")} • {formatDuration(booking.durationMinutes)}</span>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-2 sm:mt-3 pl-6 sm:pl-8 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          <span className="font-bold">Notes:</span> {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex md:items-end mt-3 md:mt-0">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button className="w-full md:w-auto border-2 border-gray-300 hover:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-6 sm:px-8 py-2 sm:py-3 font-bold text-sm sm:text-base transition-all duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
