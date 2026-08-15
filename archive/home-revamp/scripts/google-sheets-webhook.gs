/**
 * Deploy this as a Google Apps Script web app (Execute as: Me, Access: Anyone).
 * Replace SHEET_NAME with your tab name. First row should be headers:
 * Timestamp | Name | Phone | WhatsApp Same | Room Type | Design Style | Budget | Priority | Timeline | Notes | Photos | Vision | Budget Est | Items | Bangalore Tip
 */
function doPost(e) {
  const SHEET_NAME = "Leads";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.phone || "",
    data.whatsappSame || "",
    data.roomType || "",
    data.designStyle || "",
    data.budgetBand || "",
    data.priority || "",
    data.timeline || "",
    data.revampNotes || "",
    data.photoCount || 0,
    data.visionSummary || "",
    data.estimatedBudget || "",
    data.items || "",
    data.bangaloreTip || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
