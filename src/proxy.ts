import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
]);

const isOwnerRoute = createRouteMatcher([
  "/prep(.*)",
]);

const OWNER_EMAIL = "joelnishanthreddy@gmail.com";

const handler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isOwnerRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/demo", req.url));
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;
    if (email !== OWNER_EMAIL) {
      return NextResponse.redirect(new URL("/demo", req.url));
    }
  }
});

export function proxy(
  ...args: Parameters<typeof handler>
): ReturnType<typeof handler> {
  return handler(...args);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
