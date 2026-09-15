# RJ Mowing KW

Website for RJ Mowing KW, a lawn mowing business serving Kitchener and Waterloo, Ontario.

## Structure

```
index.html          Landing page
lawn-mowing.html     Lawn mowing service page
book-now.html        Booking form
css/style.css         Site styles
js/main.js            Shared behavior (navigation, FAQ, animations)
js/booking.js         Booking form logic and time slot generation
apps-script/Code.gs   Google Apps Script backend (paste into Apps Script later)
assets/favicon.svg    Site icon
```

This is a static site. Open `index.html` in a browser, or host the folder on
any static hosting provider (Netlify, Vercel, GitHub Pages, or plain web
hosting).

## Booking hours and time slots

- Monday to Friday: 3:00 PM to 9:00 PM
- Saturday and Sunday: 9:00 AM to 9:00 PM
- Times are shown in 30 minute intervals (3:00, 3:30, 4:00, and so on).
- The selected time is treated as a preferred, estimated arrival window, not
  a guaranteed appointment slot.

This logic lives in `js/booking.js` in the `buildTimeSlots` function.

## Connecting the booking form to Google Sheets

The booking form is ready to submit to a Google Apps Script Web App, which
will write each booking as a new row in a Google Sheet. This has not been
connected yet. To finish the setup:

1. Create a new Google Sheet (for example, name it "RJ Mowing KW Bookings").
2. In the Sheet, open **Extensions > Apps Script**.
3. Delete any starter code and paste in the contents of `apps-script/Code.gs`
   from this repository.
4. Save the project.
5. Click **Deploy > New deployment**.
   - Select type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Click **Deploy** and authorize the script when prompted.
7. Copy the Web App URL that is generated.
8. Open `js/booking.js` in this project and replace:
   ```js
   var GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   with the copied URL.
9. Re-deploy the site (or refresh the page if testing locally).

Once connected, every booking submitted on `book-now.html` will be added as a
new row in the "Bookings" tab of the Sheet, with these columns: Timestamp,
Name, Email, Phone, Service Address, Service Type, Preferred Date, Preferred
Time, Notes, Submitted At, Source.

If the Apps Script code is ever updated after the first deployment, use
**Deploy > Manage deployments > Edit > New version** so the live Web App URL
picks up the change. The URL itself does not need to be updated again unless
a brand new deployment is created.

## Before going live

- The footer currently has no phone number or email. Add them once
  available, or keep the site pointing people to the Book Now form.
- Connect the booking form to Google Sheets using the steps above.
