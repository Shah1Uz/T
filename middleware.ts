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
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const { userId } = session;

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    if (!userId) return session.redirectToSignIn();
  }

  // Note: Blocked user check is now handled in RootLayout using Prisma 
  // to avoid expensive Clerk API calls in the Edge runtime.

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
