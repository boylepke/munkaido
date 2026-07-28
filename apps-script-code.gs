/**
 * SHIFT LOG — Drive upload relay
 * Deploy this as a Web App (see instructions below), then paste the
 * resulting /exec URL into CONFIG.APPS_SCRIPT_URL in hours-tracker.html
 *
 * DEPLOY STEPS:
 * 1. Go to script.google.com -> New project
 * 2. Delete the placeholder code, paste this whole file in
 * 3. Edit SHARED_SECRET and FOLDER_ID below
 * 4. Click Deploy -> New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Authorize when prompted (Drive access, under your own account —
 *    the folder must be owned by, or shared with edit access to, this
 *    same account)
 * 6. Copy the URL ending in /exec — that goes into the HTML file's CONFIG
 *
 * NOTE: every time you edit this script after the first deploy, you
 * must redeploy — Deploy -> Manage deployments -> pencil icon ->
 * Version: New version -> Deploy. Saving alone does not update a live
 * Web App.
 */

var SHARED_SECRET = 'change-me';           // must match CONFIG.SHARED_SECRET in the HTML
var FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';    // the shared folder's ID, from its Drive URL

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.secret !== SHARED_SECRET) {
      return jsonOut({ status: 'error', message: 'bad secret' });
    }

    var fileBlob = Utilities.newBlob(
      Utilities.base64Decode(data.fileBase64),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data.filename
    );

    var folder = DriveApp.getFolderById(FOLDER_ID);
    folder.createFile(fileBlob);

    return jsonOut({ status: 'ok' });

  } catch (err) {
    return jsonOut({ status: 'error', message: err.message });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
