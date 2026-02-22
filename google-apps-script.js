/**
 * Google Apps Script — Receives orders from the landing page
 * and writes them to the active Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://sheets.google.com → Create a new spreadsheet
 * 2. Name the first row headers:
 *    A: תאריך | B: שם | C: טלפון | D: דגם | E: מחיר אופניים | F: חבילת אביזרים | G: מחיר חבילה | H: סה״כ
 * 3. Go to Extensions → Apps Script
 * 4. Delete any existing code and paste this entire file
 * 5. Click Deploy → New deployment
 * 6. Select type: "Web app"
 * 7. Set "Execute as": Me
 * 8. Set "Who has access": Anyone
 * 9. Click Deploy → Copy the URL
 * 10. Paste the URL into GOOGLE_SCRIPT_URL in page.tsx
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Format the timestamp for Israel timezone
    var timestamp = new Date(data.timestamp);
    var formattedDate = Utilities.formatDate(timestamp, "Asia/Jerusalem", "dd/MM/yyyy HH:mm");

    sheet.appendRow([
      formattedDate,
      data.name,
      data.phone,
      data.bike,
      data.bikePrice,
      data.bundle,
      data.bundlePrice,
      data.total,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET requests for testing
function doGet() {
  return ContentService
    .createTextOutput("✅ Script is working! Send POST requests from the landing page.")
    .setMimeType(ContentService.MimeType.TEXT);
}
