import type { LeadPayload } from "./types";

export async function saveLead(lead: LeadPayload): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  const row = {
    timestamp: new Date().toISOString(),
    name: lead.name,
    phone: lead.phone,
    whatsappSame: lead.whatsappSame ? "Yes" : "No",
    roomType: lead.brief.roomType,
    designStyle: lead.brief.designStyle,
    budgetBand: lead.brief.budgetBand,
    priority: lead.brief.priority,
    timeline: lead.brief.timeline,
    revampNotes: lead.brief.revampNotes,
    photoCount: lead.photoCount,
    visionSummary: lead.vision.visionSummary,
    estimatedBudget: `${lead.vision.estimatedBudget.min}–${lead.vision.estimatedBudget.max}`,
    items: lead.vision.items.map((i) => i.name).join(", "),
    bangaloreTip: lead.vision.bangaloreTip,
  };

  if (!webhookUrl) {
    console.log("[Belvie lead — configure GOOGLE_SHEETS_WEBHOOK_URL]", row);
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save lead: ${text}`);
  }
}
