import { NextResponse } from "next/server";
import { getAfterImagePredictionStatus, isFluxConfigured } from "@/lib/flux-kontext";

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    if (!isFluxConfigured()) {
      return NextResponse.json(
        { error: "AI image service key is not configured" },
        { status: 503 },
      );
    }

    const url = new URL(request.url);
    const predictionId = url.searchParams.get("predictionId");
    if (!predictionId) {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 },
      );
    }

    const status = await getAfterImagePredictionStatus(predictionId);
    return NextResponse.json(status);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch preview status";
    console.error("[after-image-status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
