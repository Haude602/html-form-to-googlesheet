# html-form-to-googlesheet
A project that show how to collect form submission from html website directly into the google sheet and also get email with each submission using html and Javascript

## Submit a HTML form to Google Sheets


This example shows how to set up a booking form that sends data to you google sheet that you can use for any other task and also sends an email to update you in real time.

### 1. Set up a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new sheet. This is where we'll store the form data.
2. Set the following headers in the first row:

Name	Email	Number	Service	Date	Request

|   |  A   |   B   | C | D | E | F |
|---|      |   |   |   |   |  |    |
| 1 | Name | Email | Number  | Service Date    | Request |


### 2. Create a Google App Script

<img src="https://smmallcdn.net/levi/1712349215769/68747470733a2f2f73686565746d6f6e6b65792e696f2f696d672f6775696465732f312d6170702d7363726970742e6769663f74733d31.gif?ts=1" width="450" />

Click on `Extensions -> Apps Script`.

<img src="https://sheetmonkey.io/img/guides/2-script-editor.png" width="450" />

Replace the `myFunction() { ...` section with the following code snippet:

```js
// Original code from https://github.com/haude602/form-to-googlesheet

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

```

Save the project before moving on to the next step.

### 3. Run the initialSetup function

<img src="https://sheetmonkey.io/img/guides/3-initial-setup.png" width="450" />

You should see a modal asking for permissions. Click `Review permissions` and continue to the next screen.

Because this script has not been reviewed by Google, it will generate a warning before you can continue. You must click the "Go to <name of app your script> (Unsafe)" for the script to have the correct permissions to update your form.

<img src="https://sheetmonkey.io/img/guides/5-warning.png" width="450" />

After giving the script the correct permissions, you should see the following output in the script editor console:

<img src="https://sheetmonkey.io/img/guides/6-success.png" width="450" />

Now your script has the correct permissions to continue to the next step.

### 4. Add a trigger for the script

<img src="https://sheetmonkey.io/img/guides/7-triggers.png" width="450" />

Select the project "Triggers" from the sidebar and then click the `Add Trigger` button.

In the window that appears, select the following options:

- Choose which function to run: `doPost`
- Choose which deployment should run: `Head`
- Select event source: `From spreadsheet`
- Select event type: `On form submit`

<img src="https://sheetmonkey.io/img/guides/8-trigger-config.png" width="450" />

Then select "Save".

### 5. Publish the project

Now your project is ready to publish. Select the `Deploy` button and `New Deployment` from the drop-down.

<img src="https://smmallcdn.net/levi/1712349308531/9-deploy.gif" width="450" />

Click the "Select type" icon and select `Web app`. 

In the form that appears, select the following options:

- Description: `Booking form Form` (This can be anything that you want. Just make it descriptive.)
- Web app → Execute As: `Me`
- Web app → Who has access: `Anyone`

Then click `Deploy`.

**Important:** Copy and save the web app URL before moving on to the next step.

### 6. Configure your HTML form

Create a HTML form  i.e. make a file html-form.html like the following, replacing `YOUR_APP_SCRIPT_URL` with the URL you saved from the previous step.

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>HTML Page</title>
  
</head>

<body>

    

    <h1>Book A Service</h1>
        <form id="myForm" method="POST" action="YOUR_APP_SCRIPT_URL">
        <div class="row g-3">
            <div>
                <input name="Name" type="text" placeholder="Your Name" style="height: 55px;">
            </div>
            <div>
                <input name="Email" type="email" placeholder="Your Email" style="height: 55px;">
            </div>
            <div>
                <input name="Number" type="text" placeholder="Contact Number" style="height: 55px;">
            </div>
            <div>
                <select name="Service" type="text" style="height: 55px;">
                    <option selected>Select A Service</option>
                    <option>Book A Contant</option>
                    <option>Get Training</option>
                    <option>Rent A House</option>
                </select>
            </div>
            <div>
                <div id="date1" data-target-input="nearest">
                    <input name="Date" type="text" placeholder="Service Date" data-target="#date1" data-toggle="datetimepicker" style="height: 55px;">
                </div>
            </div>
            <div>
                <textarea name="Request" type="text" placeholder="Special Request"></textarea>
            </div>
            <div>
                <button type="submit">Book Now ($10)</button>
            </div>
        </div>
    </form>
    
    <!--Given below is the script that redirects the user to another page submisison-page.html after form submission-->
    <script>
        document.getElementById('myForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            var form = event.target;
    
            // Create an AJAX request
            var xhr = new XMLHttpRequest();
            xhr.open(form.method, form.action, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            // Collect form data
            var formData = new FormData(form);
            var params = new URLSearchParams();
            for (var pair of formData.entries()) {
                params.append(pair[0], pair[1]);
            }
    
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    window.location.href = 'submission-page.html'; // Redirect to payment.html after successful submission
                }
            };
    
            xhr.send(params.toString());
        });
    </script>
</body>
```

### 6. Configure your html page that you want the user to see after form submission
Create a another html file i.e. submission-page.html and add the code from below
```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>HTML Page</title>
  
</head>

<body>

    <H1>Form Successfully submitted. Wait until our team cotact you</H1>
    <h4>Thank you</h4>

        <a href="html-form.html">Go back</a>

</body>
</html>




```


Now when you submit this form from any location, the data will be saved in the Google Sheet. And the mail be also sent  to email address you set in appscript🥳






## Thanks