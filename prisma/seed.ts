import { PrismaClient, Role, BookingStatus, PaymentStatus, NotificationType, NotificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // -----------------------------
  // Create Admin User
  // -----------------------------
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      name: 'Admin User',
    },
  });

  console.log('Created admin:', admin.email);

  // -----------------------------
  // Create a Teacher user
  // -----------------------------
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: teacherPassword,
      role: Role.TEACHER,
      name: 'Teacher User',
    },
  });

  // Create teacher profile
  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      bio: 'Experienced language tutor.',
      hourlyRate: 40,
      languages: ['English', 'Spanish'],
      yearsExperience: 5,
    },
  });

  console.log('Created teacher:', teacherUser.email);

  // -----------------------------
  // Create Availability
  // -----------------------------
  await prisma.availability.createMany({
    data: [
      {
        teacherId: teacher.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
      },
      {
        teacherId: teacher.id,
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '17:00',
      },
    ],
  });

  console.log('Added availability for teacher');

  // -----------------------------
  // Create a Student user
  // -----------------------------
  const studentPassword = await bcrypt.hash('student123', 10);

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: studentPassword,
      role: Role.STUDENT,
      name: 'Student User',
    },
  });

  console.log('Created student:', student.email);

  // -----------------------------
  // Sample Booking
  // -----------------------------
  const booking = await prisma.booking.create({
    data: {
      studentId: student.id,
      teacherId: teacherUser.id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after startTime
      durationMinutes: 60,
      status: BookingStatus.CONFIRMED,
      studentTimezone: 'UTC',
      teacherTimezone: 'UTC',
    },
  });

  console.log('Created booking ID:', booking.id);

  // -----------------------------
  // Sample Payment
  // -----------------------------
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: 40,
      status: PaymentStatus.COMPLETED,
      currency: 'usd',
    },
  });

  console.log('Created payment ID:', payment.id);

  // -----------------------------
  // Sample Notification
  // -----------------------------
  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      type: NotificationType.BOOKING_CONFIRMED,
      status: NotificationStatus.SENT,
      scheduledAt: new Date(),
      sentAt: new Date(),
    },
  });

  console.log('Created sample notification');
}

main()
  .then(async () => {
    console.log('Seeding completed successfully.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
  });