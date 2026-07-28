import { NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/analyze-room";
import {
  generateFluxKontextAfterImage,
  isFluxConfigured,
} from "@/lib/flux-kontext";
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

    const images = (body.images ?? []).slice(0, 2);

    if (!images.length) {
      return NextResponse.json(
        { error: "Please upload at least one room photo" },
        { status: 400 },
      );
    }

    const vision = await analyzeRoom(body.brief, images);

    let afterImageUrl: string | null = null;
    let imageWarning: string | undefined;
    let imageSource: "flux-kontext" | "none" = "none";

    if (isFluxConfigured()) {
      try {
        const refIndex = Math.min(
          vision.roomStructure?.referencePhotoIndex ?? 0,
          images.length - 1,
        );
        const referenceImage = images[refIndex] ?? images[0];

        afterImageUrl = await generateFluxKontextAfterImage(
          referenceImage,
          body.brief,
          vision,
        );
        imageSource = "flux-kontext";
      } catch (imageError) {
        const message =
          imageError instanceof Error
            ? imageError.message
            : "Flux Kontext image edit failed";
        console.error("[analyze] flux-kontext", message);
        imageWarning =
          "Plan is ready. Photorealistic after-image failed — showing plan markers on your photo instead.";
      }
    } else {
      imageWarning =
        "Add REPLICATE_API_TOKEN to enable FLUX.1 Kontext after-images. Showing plan markers for now.";
    }

    return NextResponse.json({
      vision,
      afterImageUrl,
      imageWarning,
      imageSource,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
