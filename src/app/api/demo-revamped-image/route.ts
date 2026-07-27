import { NextResponse } from "next/server";
import { generateDemoRevampedImageUrl } from "@/lib/revamped-image";
import { normalizeVision } from "@/lib/stylist-agent";
import type { RevampBrief, RevampVision } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      beforeImageUrl: string;
      brief: RevampBrief;
      vision: Partial<RevampVision>;
    };

    if (!body.beforeImageUrl || !body.brief || !body.vision) {
      return NextResponse.json(
        { error: "beforeImageUrl, brief, and vision are required" },
        { status: 400 },
      );
    }

    const vision = normalizeVision(body.vision);

    const afterImageUrl = await generateDemoRevampedImageUrl(
      body.beforeImageUrl,
      body.brief,
      vision,
    );

    return NextResponse.json({ afterImageUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Demo image generation failed";
    console.error("[demo-revamped-image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
