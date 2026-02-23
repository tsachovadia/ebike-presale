/**
 * Google Apps Script — Receives orders from the landing page
 * and writes them to the active Google Sheet.
 *
 * SETUP:
 * 1. צור Google Sheet חדש → שמור לו שם "הזמנות אופניים"
 * 2. בשורה 1 הכנס headers:
 *    A: תאריך | B: מקור | C: שם | D: טלפון ישראלי | E: טלפון סיני | F: מיקום | G: דגם | H: מחיר אופניים | I: חבילת בטיחות | J: רישוי | K: סה״כ
 * 3. Extensions → Apps Script
 * 4. מחק הכל → הדבק את הקוד הזה → שמור (Ctrl+S)
 * 5. Deploy → New deployment
 * 6. Type: "Web app"
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Deploy → העתק את ה-URL
 * 10. הדבק את ה-URL בקובץ page.tsx במקום GOOGLE_SCRIPT_URL
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
      data.source || "unknown",
      data.name || "",
      data.phoneIsrael || "",
      data.phoneChina || "",
      data.location || "",
      data.bike || "",
      data.bikePrice || 0,
      data.bundle ? "כן (₪" + data.bundlePrice + ")" : "לא",
      data.licensing ? "כן (₪" + data.licensingPrice + ")" : "לא",
      data.total || 0,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET request — לבדיקה. פתח את ה-URL בדפדפן ואם רואים את ההודעה = עובד
function doGet() {
  return ContentService
    .createTextOutput("✅ Script is working! Send POST requests from the landing page.")
    .setMimeType(ContentService.MimeType.TEXT);
}
