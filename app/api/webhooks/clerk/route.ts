import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type as string;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);

  // Handle Billing Events
  // Note: Clerk Billing events might be under 'subscription.created', 'subscription.updated', etc.
  if (eventType === "subscription.created" || eventType === "subscription.updated") {
    const { user_id, plan_id, status, ends_at } = evt.data as any;

    if (status === "active") {
      // Map Clerk plan_id to our Plan enum/string
      let plan = "FREE";
      let priority = 0;

      // Ensure these match your Clerk Plan IDs exactly
      if (plan_id === "cplan_3BSBM0qW5fibCz4amWMuhfgLtlA" || plan_id.toLowerCase().includes("ekonom")) {
        plan = "EKONOM";
        priority = 1;
      } else if (plan_id.toLowerCase().includes("vip")) {
        plan = "VIP";
        priority = 2;
      }

      await prisma.user.update({
        where: { id: user_id },
        data: {
          plan,
          planPriority: priority,
          planExpiresAt: ends_at ? new Date(ends_at * 1000) : null,
        },
      });
    }
  }

  if (eventType === "subscription.deleted") {
     const { user_id } = evt.data as any;
     await prisma.user.update({
        where: { id: user_id },
        data: {
          plan: "FREE",
          planPriority: 0,
          planExpiresAt: null,
        },
      });
  }

  return new Response("", { status: 200 });
}
