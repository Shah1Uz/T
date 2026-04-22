import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home(.*)",
  "/about(.*)",
  "/privacy(.*)",
  "/listings/(.*)", // Public listing views
  "/api/webhooks(.*)", // Payment and Clerk webhooks
  "/pricing",
  "/search(.*)",
  "/map(.*)",
  "/blocked",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/robots.txt",
]);

// Standard Clerk middleware pattern
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
     await auth.protect();
  }

  // Set pathname header for root layout logic (e.g., blocked user check)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Handle referral code
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref) {
    response.cookies.set("referral_code", ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)",
    "/(api|trpc)(.*)",
  ],
};
