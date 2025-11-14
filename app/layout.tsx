import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Flexibook - Language Teacher Booking",
  description: "Book language lessons with flexibility",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 min-h-screen`}>
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(203, 213, 225) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

