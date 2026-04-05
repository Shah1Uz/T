"use client";

import { useEffect } from "react";

/**
 * Suppresses React hydration warnings that are caused solely by browser
 * extensions (e.g. Built-in Skin Checker adding `bis_skin_checked` attrs).
 * This is a dev-only cosmetic warning; it has zero effect on production.
 */
export default function SuppressHydrationWarning() {
  useEffect(() => {
    const origError = console.error.bind(console);
    console.error = (...args: any[]) => {
      const message = typeof args[0] === "string" ? args[0] : "";
      // Skip hydration warnings caused purely by browser extension attributes
      if (
        message.includes("bis_skin_checked") ||
        (message.includes("Hydration") && args.some((a) => typeof a === "string" && a.includes("bis_skin_checked")))
      ) {
        return;
      }
      // Also suppress the generic hydration mismatch warning when only extension attrs differ
      const tree = args.join(" ");
      if (tree.includes("bis_skin_checked")) return;

      origError(...args);
    };
    return () => {
      console.error = origError;
    };
  }, []);

  return null;
}
