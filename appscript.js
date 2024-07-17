const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function(header) {
      return header === 'Date' ? new Date() : e.parameter[header];
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    // Construct the email body with new submission details
    let emailBody = 'A new form submission has been added to the sheet. Here are the details:\n\n'; //this is the boday of email that will be sent
    headers.forEach((header, index) => {
      emailBody += `${header}: ${newRow[index]}\n`;
    });
    emailBody += `\nYou can view the sheet here: ${doc.getUrl()}`;

    // Email notification
    const emailAddress = "abc@gmail.com"; // Replace with your email address where you want to get notification
    const subject = "New Form Submission"; //replace the subject of email you want

    MailApp.sendEmail(emailAddress, subject, emailBody);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
