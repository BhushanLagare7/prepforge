import { NextRequest } from "next/server";

import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { deleteUser, upsertUser } from "@/features/users/db";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e) => e.id === clerkData.primary_email_address_id,
        )?.email_address;
        if (email == null) {
          return new Response("No primary email found", { status: 400 });
        }

        const name =
          `${clerkData.first_name ?? ""} ${clerkData.last_name ?? ""}`.trim() ||
          "Unknown";

        await upsertUser({
          id: clerkData.id,
          email,
          name,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        });

        break;
      }
      case "user.deleted": {
        if (event.data.id == null) {
          return new Response("No user ID found", { status: 400 });
        }

        await deleteUser(event.data.id);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook error:", error);
    
    // Differentiate between validation errors and internal errors
    const isValidation =
      error instanceof Error &&
      (error.message.toLowerCase().includes("webhook") ||
       error.message.toLowerCase().includes("sign") ||
       error.message.toLowerCase().includes("svix") ||
       error.name === "WebhookVerificationError");

    if (isValidation) {
      return new Response("Invalid webhook", { status: 400 });
    }
    
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}
