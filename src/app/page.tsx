"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function HomePage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status and redirect accordingly
    const isAuth = checkAuth();
    if (isAuth) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [checkAuth, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
