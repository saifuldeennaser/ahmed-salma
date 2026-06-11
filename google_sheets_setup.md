# Google Sheets RSVP Backend Setup Guide

Follow these steps to connect your wedding website's RSVP form directly to a Google Sheet.

---

## Step 1: Create your Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank spreadsheet**.
2. Name your spreadsheet (e.g., `Salma & Ahmed Wedding RSVPs`).
3. In the first row (Row 1), enter the following column headers in columns A, B, and C exactly as shown (all lowercase, case-sensitive):
   - **A1**: `name`
   - **B1**: `response`
   - **C1**: `submittedAt`

---

## Step 2: Add the Google Apps Script
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any code in the editor (`myFunction` block) and paste the following script:

```javascript
// Google Apps Script to handle RSVP submissions and retrieval

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  
  // Convert spreadsheet rows into a JSON array
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other processes to finish writing
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Parse the JSON data sent from the website
    var parameter = JSON.parse(e.postData.contents);
    
    // Match form parameters to sheet column headers
    var newRow = headers.map(function(header) {
      if (header === 'submittedAt') {
        return new Date().toISOString();
      }
      return parameter[header] || '';
    });
    
    // Append the row
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

3. Click the **Save** icon (diskette) at the top of the editor.

---

## Step 3: Deploy as a Web App
1. Click the **Deploy** button in the top right and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Wedding RSVP API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(This is important so guests can submit RSVPs without signing in)*
4. Click **Deploy**.
5. Google may ask you to **Authorize Access**. Click "Authorize access", choose your Google account, click "Advanced" (unsafe link), and then click "Allow".
6. Once deployed, copy the **Web app URL** (it will look like `https://script.google.com/macros/s/.../exec`).
7. Paste this URL into your website's [script.js](file:///c:/Users/TheSh/OneDrive/Desktop/salmas%20wedding/script.js) and [admin.html](file:///c:/Users/TheSh/OneDrive/Desktop/salmas%20wedding/admin.html) configuration (we will set up a placeholder or edit the code for you next).
