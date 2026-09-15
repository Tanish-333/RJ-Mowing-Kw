// RJ Mowing KW - booking form logic
//
// Time slots:
//   Monday to Friday: 3:00 PM to 9:00 PM, 30 minute intervals
//   Saturday and Sunday: 9:00 AM to 9:00 PM, 30 minute intervals
//
// Submission target:
//   Replace GOOGLE_SCRIPT_URL below with the deployed Google Apps Script
//   Web App URL once it is created. See apps-script/Code.gs and README.md
//   for the setup steps and the code to paste into Apps Script.

var GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

function buildTimeSlots(dayOfWeek) {
  var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  var startMinutes = isWeekend ? 9 * 60 : 15 * 60;
  var endMinutes = 21 * 60;
  var slots = [];

  for (var minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    var hour24 = Math.floor(minutes / 60);
    var minute = minutes % 60;
    var period = hour24 >= 12 ? "PM" : "AM";
    var hour12 = hour24 % 12;
    if (hour12 === 0) {
      hour12 = 12;
    }
    var label = hour12 + ":" + (minute === 0 ? "00" : minute) + " " + period;
    slots.push(label);
  }

  return slots;
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("bookingForm");
  if (!form) {
    return;
  }

  var dateInput = document.getElementById("preferredDate");
  var timeSelect = document.getElementById("preferredTime");
  var timeHelp = document.getElementById("timeHelp");
  var statusBox = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  var today = new Date();
  var todayIso = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");
  dateInput.min = todayIso;

  function populateTimeSlots() {
    timeSelect.innerHTML = "";

    if (!dateInput.value) {
      var placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a date first";
      timeSelect.appendChild(placeholder);
      timeSelect.disabled = true;
      timeHelp.textContent = "Select your preferred date to see available times.";
      return;
    }

    var parts = dateInput.value.split("-").map(Number);
    var selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var dayOfWeek = selectedDate.getDay();
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    var slots = buildTimeSlots(dayOfWeek);

    var firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Select an estimated time";
    timeSelect.appendChild(firstOption);

    slots.forEach(function (slot) {
      var option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      timeSelect.appendChild(option);
    });

    timeSelect.disabled = false;
    timeHelp.textContent = isWeekend
      ? "Weekend hours: 9:00 AM to 9:00 PM. This is your estimated arrival window."
      : "Weekday hours: 3:00 PM to 9:00 PM. This is your estimated arrival window.";
  }

  dateInput.addEventListener("change", populateTimeSlots);
  populateTimeSlots();

  function setStatus(type, message) {
    statusBox.className = "form-status visible " + type;
    statusBox.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var payload = {
      name: document.getElementById("customerName").value.trim(),
      email: document.getElementById("customerEmail").value.trim(),
      phone: document.getElementById("customerPhone").value.trim(),
      address: document.getElementById("serviceAddress").value.trim(),
      service: document.getElementById("serviceType").value,
      date: dateInput.value,
      time: timeSelect.value,
      notes: document.getElementById("extraNotes").value.trim(),
      submittedAt: new Date().toISOString(),
      source: "rjmowingkw.com"
    };

    if (GOOGLE_SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
      setStatus(
        "error",
        "Booking is not connected yet. Add the Google Apps Script Web App URL in js/booking.js before going live."
      );
      return;
    }

    submitBtn.disabled = true;
    setStatus("loading", "Sending your booking request...");

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    })
      .then(function () {
        setStatus(
          "success",
          "Thank you, " + payload.name + ". Your request for " + payload.date + " at " + payload.time +
          " has been received. You will get a text or a call as soon as possible to confirm your appointment."
        );
        form.reset();
        populateTimeSlots();
      })
      .catch(function () {
        setStatus(
          "error",
          "Something went wrong sending your request. Please call or email us directly, or try again in a moment."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
});
