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
  // Note: Inside proxy, we should be careful with external API calls.
  if (userId && !req.nextUrl.pathname.startsWith('/blocked') && !req.nextUrl.pathname.startsWith('/api')) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user.publicMetadata?.isBlocked === true) {
        return NextResponse.redirect(new URL('/blocked', req.url));
      }
    } catch (error) {
      console.error("Clerk API error in proxy:", error);
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
