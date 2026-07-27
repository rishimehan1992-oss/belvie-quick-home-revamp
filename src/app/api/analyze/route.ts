import { NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/analyze-room";
import { generateAfterImageUrl } from "@/lib/room-image";
import type { RevampBrief } from "@/lib/types";

export const maxDuration = 120;

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

    const images = (body.images ?? []).slice(0, 1);

    if (!images.length) {
      return NextResponse.json(
        { error: "Please upload at least one room photo" },
        { status: 400 },
      );
    }

    const vision = await analyzeRoom(body.brief, images);

    const afterImageUrl = await generateAfterImageUrl(
      images[0],
      body.brief,
      vision,
    );

    return NextResponse.json({ vision, afterImageUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
