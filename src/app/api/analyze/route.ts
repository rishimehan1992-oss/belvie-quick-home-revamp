import { NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/analyze-room";
import { generateRevampedImageUrl } from "@/lib/revamped-image";
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

    // Send at most 2 photos to Claude (structure analysis); keep payload under Vercel limits
    const images = (body.images ?? []).slice(0, 2);

    if (!images.length) {
      return NextResponse.json(
        { error: "Please upload at least one room photo" },
        { status: 400 },
      );
    }

    const vision = await analyzeRoom(body.brief, images);

    const refIndex = Math.min(
      vision.roomStructure.referencePhotoIndex,
      images.length - 1,
    );
    const referenceImage = images[refIndex] ?? images[0];

    let afterImageUrl: string | null = null;
    let imageWarning: string | undefined;

    try {
      afterImageUrl = await generateRevampedImageUrl(
        referenceImage,
        body.brief,
        vision,
      );
    } catch (imageError) {
      const message =
        imageError instanceof Error
          ? imageError.message
          : "Revamped image generation failed";
      console.error("[analyze] revamped-image", message);
      imageWarning =
        "Your revamp plan is ready. The photorealistic after-image could not be generated right now — try again in a minute.";
    }

    return NextResponse.json({ vision, afterImageUrl, imageWarning });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
