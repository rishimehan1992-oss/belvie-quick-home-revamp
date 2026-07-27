import { NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/deepseek";
import type { RevampBrief } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      brief: RevampBrief;
      images: string[];
    };

    if (!body.brief?.roomType || !body.brief?.budgetBand) {
      return NextResponse.json(
        { error: "Room type and budget are required" },
        { status: 400 },
      );
    }

    const vision = await analyzeRoom(body.brief, body.images ?? []);

    return NextResponse.json({ vision });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
