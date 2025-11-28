"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setMessage(
        "If an account with that email exists, we've sent a password reset link."
      );
    } else {
      const data = await response.json();
      setError(data.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm sm:text-base text-red-500">{error}</p>}
            {message && <p className="text-sm sm:text-base text-green-500">{message}</p>}
            <Button
              type="submit"
              className="w-full h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg shadow-gray-400/20 hover:shadow-xl hover:shadow-gray-500/30 rounded-xl px-6 font-bold transition-all duration-300 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Password Reset Email"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm sm:text-base">
          <p>
            Remember your password?{" "}
            <Link href="/auth/signin" className="underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
