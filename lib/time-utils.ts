import { format, parseISO, addMinutes, isWithinInterval, isBefore, isAfter } from 'date-fns'
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

export function formatTimeInTimezone(date: Date, timezone: string, formatStr: string = 'PPpp'): string {
  return formatInTimeZone(date, timezone, formatStr)
}

export function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone)
}

export function convertFromTimezone(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone)
}

export function getTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 15): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  for (let i = startMinutes; i < endMinutes; i += intervalMinutes) {
    const hour = Math.floor(i / 60)
    const min = i % 60
    slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
  }
  
  return slots
}

export interface TimeSlot {
  start: Date
  end: Date
}

export function hasTimeConflict(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Check if slot1 overlaps with slot2
  return (
    (isWithinInterval(slot1.start, { start: slot2.start, end: slot2.end }) ||
     isWithinInterval(slot1.end, { start: slot2.start, end: slot2.end }) ||
     isWithinInterval(slot2.start, { start: slot1.start, end: slot1.end }))
  )
}

export function checkAvailability(
  requestedSlot: TimeSlot,
  existingBookings: TimeSlot[],
  bufferMinutes: number = 0
): boolean {
  // Add buffer to existing bookings
  const bufferedBookings = existingBookings.map(booking => ({
    start: addMinutes(booking.start, -bufferMinutes),
    end: addMinutes(booking.end, bufferMinutes),
  }))

  // Check if requested slot conflicts with any buffered booking
  for (const booking of bufferedBookings) {
    if (hasTimeConflict(requestedSlot, booking)) {
      return false
    }
  }

  return true
}

export function getDayOfWeek(date: Date): number {
  return date.getDay() // 0-6, Sunday is 0
}

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  const timeMinutes = timeStringToMinutes(time)
  const startMinutes = timeStringToMinutes(startTime)
  const endMinutes = timeStringToMinutes(endTime)
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

