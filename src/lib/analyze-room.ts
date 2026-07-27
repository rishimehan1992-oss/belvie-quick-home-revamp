import { analyzeRoom as analyzeWithClaude } from "./claude";
import { analyzeRoomWithDeepSeek } from "./deepseek";
import type { RevampBrief, RevampVision } from "./types";

export async function analyzeRoom(
  brief: RevampBrief,
  images: string[] = [],
): Promise<RevampVision> {
  try {
    return await analyzeWithClaude(brief, images);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const creditIssue =
      message.includes("credit balance") || message.includes("billing");

    if (creditIssue) {
      if (process.env.DEEPSEEK_API_KEY) {
        console.warn("[analyze] Claude unavailable, falling back to DeepSeek");
        return analyzeRoomWithDeepSeek(brief, images.length);
      }

      throw new Error(
        "Claude API credits are too low. Configure `DEEPSEEK_API_KEY` in Vercel to enable fallback for the revamp plan.",
      );
    }

    throw error;
  }
}
