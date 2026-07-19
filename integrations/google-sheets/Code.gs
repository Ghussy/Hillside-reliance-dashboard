const SHEET_NAME = 'Intake Responses';
const SPREADSHEET_ID = '1OLC56VH3rFAgqLTz6SF2ErYeLD5mscUrYBaKJJWN_DE';

const COLUMNS = [
  ['Submission ID', 'submissionId'],
  ['Submitted At', 'submittedAt'],
  ['Full Name', 'fullName'],
  ['Phone', 'phone'],
  ['Email', 'email'],
  ['Address', 'address'],
  ['Preferred Contact Method', 'preferredContactMethod'],
  ['Best Contact Times', 'bestContactTimes'],
  ['Household Information', 'householdInfo'],
  ['Assistance Types', 'assistanceTypes'],
  ['Other Assistance', 'assistanceOther'],
  ['Situation Description', 'situationDescription'],
  ['Need Started', 'needStarted'],
  ['Need Duration', 'needDuration'],
  ['Help Already Tried', 'helpTried'],
  ['Current Support Available', 'currentSupportAvailable'],
  ['Urgent Deadlines', 'urgentDeadlines'],
  ['Urgency Level', 'urgencyLevel'],
  ['Urgency Flags', 'urgencyFlags'],
  ['Safety Concerns', 'safetyConcerns'],
  ['Income / Employment Status', 'incomeEmploymentStatus'],
  ['Major Expenses', 'majorExpenses'],
  ['Requested Amount', 'requestedAmount'],
  ['Bill Due Dates', 'billDueDates'],
  ['Other Resources Contacted', 'otherResourcesContacted'],
  ['Support Sources', 'supportSources'],
  ['Church Assistance Details', 'churchAssistanceDetails'],
  ['Professional Services', 'professionalServices'],
  ['Follow-up Plans', 'followUpPlans'],
  ['Follow-up Contact Name', 'followUpContactName'],
  ['Follow-up Availability', 'followUpAvailability'],
  ['Share Permission', 'sharePermission'],
  ['Privacy Acknowledgement', 'privacyAcknowledgement']
];

function configureIntakeWebhook(secret) {
  if (!secret) {
    throw new Error('A webhook secret is required.');
  }

  PropertiesService.getScriptProperties().setProperty(
    'INTAKE_WEBHOOK_SECRET',
    secret
  );
  getIntakeSheet();
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const payload = JSON.parse(event.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      'INTAKE_WEBHOOK_SECRET'
    );

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized.' });
    }

    const sheet = getIntakeSheet();
    const submission = payload.submission || {};

    if (
      submission.submissionId &&
      sheet
        .getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
        .createTextFinder(String(submission.submissionId))
        .matchEntireCell(true)
        .findNext()
    ) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    const row = COLUMNS.map(([, key]) => safeCellValue(submission[key]));

    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function getIntakeSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = COLUMNS.map(([label]) => label);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  return sheet;
}

function safeCellValue(value) {
  const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');

  if (/^[=+\-@]/.test(text)) {
    return `'${text}`;
  }

  return text;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
