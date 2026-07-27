import { NextResponse } from "next/server";
import { saveLead } from "@/lib/sheets";
import type { LeadPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const phone = body.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number" },
        { status: 400 },
      );
    }

    await saveLead({
      ...body,
      phone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save lead";
    console.error("[leads]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
