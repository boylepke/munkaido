/**
 * SHIFT LOG — email relay
 * Deploy this as a Web App (see instructions below), then paste the
 * resulting /exec URL into CONFIG.APPS_SCRIPT_URL in hours-tracker.html
 *
 * DEPLOY STEPS:
 * 1. Go to script.google.com -> New project
 * 2. Delete the placeholder code, paste this whole file in
 * 3. Edit SHARED_SECRET, SENDERS and RECIPIENTS below to match the
 *    NAMES / SUPERVISORS lists in hours-tracker.html
 * 4. Click Deploy -> New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Authorize when prompted (it's your own script, using your own Gmail
 *    as the actual sending account — colleagues' addresses are used as
 *    the Reply-To, not the technical From, since Gmail won't let a
 *    script send AS an arbitrary address it doesn't own)
 * 6. Copy the URL ending in /exec — that goes into the HTML file's CONFIG
 */

var SHARED_SECRET = 'change-me'; // must match CONFIG.SHARED_SECRET in the HTML

// Must mirror CONFIG.NAMES in the HTML — name -> their email (used as Reply-To)
var SENDERS = {
  'Name 1': 'name1@example.com',
  'Name 2': 'name2@example.com',
  'Name 3': 'name3@example.com',
  'Name 4': 'name4@example.com'
};

// Must mirror CONFIG.SUPERVISORS in the HTML — supervisor name -> their email
var RECIPIENTS = {
  'Supervisor 1': 'supervisor1@example.com',
  'Supervisor 2': 'supervisor2@example.com'
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.secret !== SHARED_SECRET) {
      return jsonOut({ status: 'error', message: 'bad secret' });
    }

    // Validate sender + recipient against the allowlists above, rather than
    // trusting whatever the client sent — this stops the endpoint being
    // used to relay mail to arbitrary addresses if the URL ever leaks.
    var senderEmail = SENDERS[data.name];
    var recipientEmail = RECIPIENTS[data.recipientName];

    if (!senderEmail) {
      return jsonOut({ status: 'error', message: 'unknown sender name' });
    }
    if (!recipientEmail) {
      return jsonOut({ status: 'error', message: 'unknown recipient' });
    }

    var fileBlob = Utilities.newBlob(
      Utilities.base64Decode(data.fileBase64),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data.filename
    );

    var body =
      'Week: ' + data.week + '\n' +
      'Date: ' + data.date + '\n' +
      'Name: ' + data.name + '\n' +
      'From: ' + data.from + '\n' +
      'To: ' + data.to + '\n' +
      'Equipment: ' + data.equipment;

    MailApp.sendEmail({
      to: recipientEmail,
      replyTo: senderEmail,
      name: data.name + ' (Shift Log)',
      subject: 'Shift Log — ' + data.week + ' — ' + data.name,
      body: body,
      attachments: [fileBlob]
    });

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
