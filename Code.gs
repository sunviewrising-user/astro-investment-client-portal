const ADMIN_EMAIL = 'sunviewrising@gmail.com';
const SHEET_NAME = 'Consultations';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    validateSubmission_(data);
    const result = saveSubmission_(data);
    sendEmails_(data, result.consultationReference);
    return json_({ok:true, clientId:data.clientId, consultationReference:result.consultationReference});
  } catch (error) {
    console.error(error);
    return json_({ok:false, error:'Submission could not be processed.'});
  }
}

function validateSubmission_(data) {
  if (!data.clientId || !data.consultationType || !data.consentData || !data.consentDisclaimer || !data.consentAccuracy) throw new Error('Missing required data');
  const email = data.consultationType === 'Next Consultation' ? data.existingEmail : data.email;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Invalid email');
  if (JSON.stringify(data).length > 50000) throw new Error('Submission too large');
}

function saveSubmission_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const consultationNo = countConsultations_(sheet, data.clientId) + 1;
    const reference = `${data.clientId}/C${String(consultationNo).padStart(2,'0')}`;
    const headers = getHeaders_();
    const row = headers.map(header => {
      if (header === 'consultationReference') return reference;
      const value = data[header];
      return Array.isArray(value) ? value.join(', ') : (value == null ? '' : value);
    });
    sheet.appendRow(row);
    return {consultationReference:reference};
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(getHeaders_());
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function countConsultations_(sheet, clientId) {
  if (sheet.getLastRow() < 2) return 0;
  const ids = sheet.getRange(2, 3, sheet.getLastRow()-1, 1).getDisplayValues().flat();
  return ids.filter(id => id === clientId).length;
}

function getHeaders_() {
  return ['submittedAt','consultationType','clientId','consultationReference','fullName','email','mobile','gender','maritalStatus','language','existingClientId','existingEmail','dateOfBirth','timeOfBirth','birthTimeAccuracy','birthPlace','birthDistrict','birthState','birthCountry','presentCity','employment','annualIncome','primaryIncome','monthlyCapacity','experience','horizon','risk','liabilities','investmentAreas','financialGoals','consultationArea','question','fee','paymentStatus','transactionId','consentData','consentDisclaimer','consentAccuracy','source'];
}

function sendEmails_(data, reference) {
  const clientEmail = data.consultationType === 'Next Consultation' ? data.existingEmail : data.email;
  const clientName = data.fullName || 'Client';
  const details = Object.keys(data).map(key => `${key}: ${Array.isArray(data[key]) ? data[key].join(', ') : data[key]}`).join('\n');
  MailApp.sendEmail({to:ADMIN_EMAIL,subject:`New Astro Investment request — ${reference}`,body:`Consultation reference: ${reference}\n\n${details}`,name:'Astro Investment Portal'});
  MailApp.sendEmail({to:clientEmail,subject:`Astro Investment consultation received — ${reference}`,body:`Dear ${clientName},\n\nWe have received your consultation request.\n\nClient ID: ${data.clientId}\nConsultation reference: ${reference}\nFee: ₹${data.fee || 500}\nPayment status: ${data.paymentStatus || 'Pending'}\n\nPlease keep your Client ID for future consultations. Astrology is a traditional belief-based practice. This service does not guarantee financial results or replace advice from a SEBI-registered professional.\n\nRegards,\nAstro Investment`,name:'Astro Investment'});
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}
