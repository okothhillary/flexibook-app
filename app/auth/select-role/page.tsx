"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function SelectRolePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: "STUDENT" | "TEACHER") => {
    setLoading(true);
    setError(null);

    if (status !== "authenticated" || !session?.user?.email) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, role }),
    });

    if (response.ok) {
      await update({ role });
      if (role === "TEACHER") router.push("/teachers/profile");
      else router.push("/dashboard");
    } else {
      const data = await response.json();
      setError(data.message || "Something went wrong");
    }

    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
            Choose Your Role
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-3 sm:space-y-4">
          <p className="text-center text-gray-600 text-sm sm:text-base">
            Are you a student looking to learn, or a teacher wanting to share
            your knowledge?
          </p>

          <Button
            onClick={() => handleRoleSelection("STUDENT")}
            className="w-full h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg"
            disabled={loading || status !== "authenticated"}
          >
            I'm a Student
          </Button>

          <Button
            onClick={() => handleRoleSelection("TEACHER")}
            className="w-full h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg"
            disabled={loading || status !== "authenticated"}
          >
            I'm a Teacher
          </Button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
