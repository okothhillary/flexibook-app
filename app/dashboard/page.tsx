import { Navbar } from "@/components/navbar";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navbar />

      {/* Responsive Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              session.user.role === "STUDENT"
                ? `
              radial-gradient(circle at 35% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 55%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 55%),
              radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.10) 0%, transparent 55%),
              linear-gradient(135deg, rgba(249, 250, 252, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)
            `
                : `
              radial-gradient(circle at 25% 30%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
              radial-gradient(circle at 75% 70%, rgba(99, 102, 241, 0.12) 0%, transparent 55%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.10) 0%, transparent 55%),
              linear-gradient(135deg, rgba(248, 249, 251, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-40 sm:opacity-30 md:opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(60deg, transparent, transparent 65px, rgba(99, 102, 241, 0.03) 65px, rgba(99, 102, 241, 0.03) 130px),
              repeating-linear-gradient(-60deg, transparent, transparent 65px, rgba(168, 85, 247, 0.03) 65px, rgba(168, 85, 247, 0.03) 130px)
            `,
          }}
        />
      </div>

      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
        <div className="w-full max-w-7xl mx-auto">
          {session.user.role === "STUDENT" && <StudentDashboard />}
          {session.user.role === "TEACHER" && <TeacherDashboard />}
        </div>
      </main>
    </div>
  );
}
