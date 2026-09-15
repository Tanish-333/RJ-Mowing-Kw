/**
 * RJ Mowing KW - Booking form backend
 *
 * This script receives booking submissions from the website's Book Now form
 * and appends them as new rows in a Google Sheet.
 *
 * Setup steps are in README.md. Summary:
 *   1. Create a Google Sheet named "RJ Mowing KW Bookings" (or any name).
 *   2. Open Extensions > Apps Script and paste this file in as Code.gs.
 *   3. Update SHEET_NAME below if you used a different tab name.
 *   4. Deploy > New deployment > Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *   5. Copy the deployed Web App URL into js/booking.js as GOOGLE_SCRIPT_URL.
 */

var SHEET_NAME = "Bookings";

var SHEET_HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Phone",
  "Service Address",
  "Service Type",
  "Preferred Date",
  "Preferred Time",
  "Notes",
  "Submitted At",
  "Source"
];

function getBookingSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getBookingSheet_();

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.address || "",
      data.service || "",
      data.date || "",
      data.time || "",
      data.notes || "",
      data.submittedAt || "",
      data.source || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "RJ Mowing KW booking endpoint is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}
