import type { RevampBrief, RevampVision } from "./types";
import {
  buildStylistAgentPrompt,
  parseVisionJson,
} from "./stylist-agent";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";

export async function analyzeRoomWithDeepSeek(
  brief: RevampBrief,
  photoCount: number,
): Promise<RevampVision> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const prompt =
    buildStylistAgentPrompt(brief, photoCount, false) +
    "\n\nNote: Photos are not available in this fallback request — state assumptions clearly for a typical Bengaluru room.";

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`DeepSeek error (${response.status}): ${raw}`);
  }

  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty DeepSeek response");

  return parseVisionJson(content);
}
