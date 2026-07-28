# Sri Durka Academy Website

A modern, responsive website for Sri Durka Academy, built with plain HTML, CSS, and JavaScript.

## Project Overview

This website showcases:
- Tuition classes for students from 1st to 12th standard
- Abacus training for children aged 4 to 16
- Spoken English and Hindi classes
- Computer courses such as DCA, full stack development, AI/ML, cyber security, and more
- Contact and enquiry information for the academy

## Features

- Responsive layout for desktop and mobile
- Clean modern design with professional styling
- Navigation across Home, About, Courses, Services, Gallery, and Contact pages
- Interactive gallery and lightbox experience
- Enquiry form UI with smooth interactions

## Project Structure

- `index.html` – Home page
- `about.html` – About page
- `courses.html` – Courses page
- `services.html` – Services page
- `gallery.html` – Gallery page
- `contact.html` – Contact page
- `css/style.css` – Main stylesheet
- `js/main.js` – Website interactions such as mobile nav, scroll reveal, gallery filter, and lightbox
- `images/` – Logos, flyers, certificates, and other media assets

## How to Run Locally

1. Open the project folder in your browser.
2. Double-click `index.html` or open it using a local web server.

Example using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Google Sheets Integration for Enquiries

Enquiry form submissions on `contact.html` can automatically log into a Google Sheet so the academy owner can view all leads in real time.

### How to set up Google Sheets (3-step setup):

1. **Create a Google Sheet**:
   - Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet (e.g. named `Sri Durka Academy Enquiries`).
   - In Row 1, add these headers: `Timestamp | Name | Phone | Email | Interested Program | Message`

2. **Add Apps Script**:
   - Click **Extensions** > **Apps Script**.
   - Delete any existing code in `Code.gs` and paste the following script:

   ```javascript
   function doPost(e) {
     try {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data = e.parameter;
       
       if (e.postData && e.postData.contents) {
         try {
           var parsed = JSON.parse(e.postData.contents);
           data = parsed;
         } catch(err) {}
       }

       var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
       var name = data.name || "";
       var phone = data.phone || "";
       var email = data.email || "";
       var interest = data.interest || "";
       var message = data.message || "";

       sheet.appendRow([timestamp, name, phone, email, interest, message]);

       return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (error) {
       return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

3. **Deploy as Web App**:
   - Click **Deploy** > **New deployment**.
   - Select type: **Web app**.
   - Set **Execute as**: *Me*.
   - Set **Who has access**: *Anyone*.
   - Click **Deploy**, authorize permissions, and copy the **Web app URL**.
   - Paste your Web App URL into `js/main.js` (`var GOOGLE_SHEET_SCRIPT_URL = "YOUR_WEB_APP_URL";`) or directly in `contact.html` (`data-sheet-url="YOUR_WEB_APP_URL"`).

## Contact

Sri Durka Academy
- Phone: 77086 41729 / 95665 31194
- Email: sridurkacomputers@gmail.com
- Location: Krishnankovil, Virudhunagar District, Tamil Nadu

## License

This project is for educational and promotional use for Sri Durka Academy.
