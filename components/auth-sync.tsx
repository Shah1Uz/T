"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthSync() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/auth/sync");
    }
  }, [isSignedIn]);

  return null;
}
