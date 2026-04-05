import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
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
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const { userId } = session;

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    if (!userId) return session.redirectToSignIn();
  }

  // Real-time block check using Clerk API
  if (userId && !req.nextUrl.pathname.startsWith('/blocked') && !req.nextUrl.pathname.startsWith('/api')) {
    try {
      // In Next.js Middleware (Edge Runtime), clerkClient() is available but should be used sparingly.
      // We check if the user is blocked from the publicMetadata.
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      if (user?.publicMetadata?.isBlocked === true) {
        return NextResponse.redirect(new URL('/blocked', req.url));
      }
    } catch (error) {
      // If Clerk API fails, we log it but allow the request to proceed to avoid 500 errors
      // and ensure the app remains functional.
      console.error("Clerk API error in middleware:", error);
    }
  }

  // Set pathname header for root layout fallback
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
