import { NextResponse } from "next/server";
import { isFluxConfigured, startAfterImagePrediction } from "@/lib/flux-kontext";
import type { RevampBrief, RevampVision } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      brief: RevampBrief;
      vision: RevampVision;
      referenceImage: string;
    };

    if (!body.brief || !body.vision || !body.referenceImage) {
      return NextResponse.json(
        { error: "brief, vision and referenceImage are required" },
        { status: 400 },
      );
    }

    if (!isFluxConfigured()) {
      return NextResponse.json(
        { error: "AI image service key is not configured" },
        { status: 503 },
      );
    }

    const predictionId = await startAfterImagePrediction(
      body.referenceImage,
      body.brief,
      body.vision,
    );

    return NextResponse.json({ predictionId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "After-image generation failed";
    console.error("[after-image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
