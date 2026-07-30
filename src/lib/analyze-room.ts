import {
  analyzeRoom as analyzeWithClaude,
  isClaudeFallbackableError,
} from "./claude";
import { analyzeRoomWithDeepSeek } from "./deepseek";
import type { RevampBrief, RevampVision } from "./types";

export async function analyzeRoom(
  brief: RevampBrief,
  images: string[] = [],
): Promise<RevampVision> {
  try {
    return await analyzeWithClaude(brief, images);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[analyze] Claude failed:", message);

    if (isClaudeFallbackableError(message) && process.env.DEEPSEEK_API_KEY) {
      console.warn("[analyze] Falling back to DeepSeek");
      return analyzeRoomWithDeepSeek(brief, images.length);
    }

    if (isClaudeFallbackableError(message) && !process.env.DEEPSEEK_API_KEY) {
      throw new Error(
        "Claude API is unavailable (credits/billing/auth). Add DEEPSEEK_API_KEY in Vercel for fallback, or top up Anthropic credits.",
      );
    }

    // JSON / truncated / incomplete responses — still try DeepSeek so the flow works
    const unusable =
      /parse|incomplete|empty response|expected|position|syntax|json|truncated|tool_use/i.test(
        message,
      );
    if (process.env.DEEPSEEK_API_KEY && unusable) {
      console.warn("[analyze] Claude response unusable, falling back to DeepSeek");
      return analyzeRoomWithDeepSeek(brief, images.length);
    }

    throw new Error(
      message.startsWith("Claude error")
        ? message
        : `Analysis failed: ${message}`,
    );
  }
}
