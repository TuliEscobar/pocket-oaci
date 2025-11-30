import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json();

        if (plan !== 'free' && plan !== 'pro') {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const client = await clerkClient();

        // Update user metadata
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                plan: plan,
                plan_selected_at: new Date().toISOString()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error setting plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
