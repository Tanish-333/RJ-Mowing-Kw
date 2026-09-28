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

function normalizePhoneDigits_(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.charAt(0) === "1") {
    digits = digits.slice(1);
  }
  return digits;
}

function isRepetitiveOrSequentialDigits_(digits) {
  if (/^(\d)\1+$/.test(digits)) {
    return true;
  }
  var ascending = "01234567890123456789";
  var descending = "98765432109876543210";
  return ascending.indexOf(digits) !== -1 || descending.indexOf(digits) !== -1;
}

function isValidPhoneNumber_(rawValue) {
  var digits = normalizePhoneDigits_(rawValue);
  if (digits.length !== 10 || isRepetitiveOrSequentialDigits_(digits)) {
    return false;
  }
  var areaCode = digits.slice(0, 3);
  var exchangeCode = digits.slice(3, 6);
  return /^[2-9]\d{2}$/.test(areaCode) && /^[2-9]\d{2}$/.test(exchangeCode);
}

function isValidServiceAddress_(rawValue) {
  var value = String(rawValue || "").trim();
  if (value.length < 8) {
    return false;
  }

  var match = value.match(/^(\d{1,6})\s+([A-Za-z][A-Za-z0-9'.-]*(?:\s+[A-Za-z0-9'.-]+)*)/);
  if (!match) {
    return false;
  }

  var letters = match[2].replace(/[^A-Za-z]/g, "");
  if (letters.length < 3 || /^(.)\1+$/i.test(letters)) {
    return false;
  }

  return true;
}

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

    if (!isValidPhoneNumber_(data.phone)) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Invalid phone number." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!isValidServiceAddress_(data.address)) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Invalid service address." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

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
