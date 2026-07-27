import { NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/claude";
import { buildAfterImagePrompt, buildAfterImageUrl } from "@/lib/image-gen";
import type { RevampBrief } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      brief: RevampBrief;
      images?: string[];
    };

    if (!body.brief?.roomType || !body.brief?.budgetBand) {
      return NextResponse.json(
        { error: "Room type and budget are required" },
        { status: 400 },
      );
    }

    const images = (body.images ?? []).slice(0, 2);

    const vision = await analyzeRoom(body.brief, images);

    const afterImagePrompt = buildAfterImagePrompt(body.brief, vision);
    const afterImageUrl = buildAfterImageUrl(afterImagePrompt);

    return NextResponse.json({ vision, afterImageUrl, afterImagePrompt });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
