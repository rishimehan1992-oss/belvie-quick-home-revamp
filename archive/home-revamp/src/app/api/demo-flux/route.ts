import { NextResponse } from "next/server";
import {
  generateFluxKontextAfterImage,
  isFluxConfigured,
} from "@/lib/flux-kontext";
import { normalizeVision } from "@/lib/stylist-agent";
import type { RevampBrief, RevampVision } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    if (!isFluxConfigured()) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN not configured — Flux Kontext after-images disabled",
        },
        { status: 503 },
      );
    }

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
    const afterImageUrl = await generateFluxKontextAfterImage(
      body.beforeImageUrl,
      body.brief,
      vision,
    );

    return NextResponse.json({ afterImageUrl, imageSource: "flux-kontext" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Flux demo image failed";
    console.error("[demo-flux]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
