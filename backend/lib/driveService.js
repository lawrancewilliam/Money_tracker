import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth.js';

const SPREADSHEET_NAME = 'Pocket Money Data';
const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

let validatedSpreadsheetId = null;

export function getConfiguredFolderId() {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id || !String(id).trim()) {
    throw new Error(
      'Google Drive Error: GOOGLE_DRIVE_FOLDER_ID is not set. Add it to your root .env file with the ID of the Drive folder shared with the service account.'
    );
  }
  return id.trim();
}

export function getConfiguredSpreadsheetId() {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id || !String(id).trim()) return null;
  return id.trim();
}

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: getGoogleAuth() });
}

function describeGoogleError(e, resource) {
  const status = e?.response?.status || (typeof e?.code === 'number' ? e?.code : null);
  const reason = e?.errors?.[0]?.reason;
  const message = e?.errors?.[0]?.message || e?.message || '';
  if (reason === 'invalid_grant') {
    return 'Google Auth Error: Invalid service account credentials — Google rejected the email/private key pair. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.';
  }
  if (status === 429 || reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
    return 'Google Drive Error: Rate limit exceeded. Retry in a few seconds.';
  }
  if (reason === 'storageQuotaExceeded' || /storage/i.test(message)) {
    return 'Google Drive Error: The service account has no Drive storage quota available, so the app cannot create new spreadsheets. It uses the existing spreadsheet configured via GOOGLE_SPREADSHEET_ID.';
  }
  if (status === 404) {
    return `Google Drive Error: ${resource} not found. It may have been deleted or the ID is wrong. Verify GOOGLE_SPREADSHEET_ID / GOOGLE_DRIVE_FOLDER_ID in .env.`;
  }
  if (status === 403) {
    return `Google Drive Error: Permission denied on ${resource}. Share the ${resource} with the service account (GOOGLE_SERVICE_ACCOUNT_EMAIL) using Editor access.`;
  }
  return `Google Drive Error (${resource}): ${message || 'Unknown Google API error'}`;
}

async function driveRequest(resource, fn) {
  try {
    return await fn();
  } catch (e) {
    throw new Error(describeGoogleError(e, resource), { cause: e });
  }
}

export async function findDataSpreadsheet() {
  const drive = getDriveClient();
  const folderId = getConfiguredFolderId();

  const res = await driveRequest('Drive folder', () =>
    drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='${SPREADSHEET_MIME_TYPE}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, webViewLink)',
      spaces: 'drive',
    })
  );

  return res.data.files.length > 0 ? res.data.files[0] : null;
}

export async function validateSpreadsheet(id) {
  if (validatedSpreadsheetId === id) return id;
  if (!id || !String(id).trim()) throw new Error('Google Drive Error: GOOGLE_SPREADSHEET_ID is empty.');
  const drive = getDriveClient();
  const res = await driveRequest('spreadsheet', () =>
    drive.files.get({ fileId: id, fields: 'id, name, mimeType, trashed' })
  );
  if (res.data.mimeType !== SPREADSHEET_MIME_TYPE) {
    throw new Error(`Google Drive Error: GOOGLE_SPREADSHEET_ID does not point to a Google Sheet (got ${res.data.mimeType}).`);
  }
  if (res.data.trashed) {
    throw new Error('Google Drive Error: The configured spreadsheet is in the Trash. Restore it or update GOOGLE_SPREADSHEET_ID.');
  }
  validatedSpreadsheetId = id;
  return id;
}

export async function getSpreadsheetId() {
  const configured = getConfiguredSpreadsheetId();
  if (configured) return validateSpreadsheet(configured);

  const existing = await findDataSpreadsheet();
  if (existing) return existing.id;

  throw new Error(
    'Google Sheets Error: The "Pocket Money Data" spreadsheet was not found in the configured Drive folder (GOOGLE_DRIVE_FOLDER_ID). The app does not auto-create spreadsheets because the service account has no Drive storage quota. Create the spreadsheet, share it with the service account using Editor access, or set GOOGLE_SPREADSHEET_ID in .env.'
  );
}

export async function findOrCreateSpreadsheet() {
  const configured = getConfiguredSpreadsheetId();
  if (configured) {
    const id = await validateSpreadsheet(configured);
    return { id, name: SPREADSHEET_NAME, webViewLink: '' };
  }

  const existing = await findDataSpreadsheet();
  if (existing) return existing;

  throw new Error(
    'Google Sheets Error: The "Pocket Money Data" spreadsheet was not found in the configured Drive folder (GOOGLE_DRIVE_FOLDER_ID). The app does not auto-create spreadsheets because the service account has no Drive storage quota. Create the spreadsheet, share it with the service account using Editor access, or set GOOGLE_SPREADSHEET_ID in .env.'
  );
}

export async function createBackupFolder() {
  const drive = getDriveClient();
  const folderId = getConfiguredFolderId();

  const res = await driveRequest('Drive folder', () =>
    drive.files.list({
      q: `name='Backups' and mimeType='application/vnd.google-apps.folder' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    })
  );

  if (res.data.files.length > 0) return res.data.files[0].id;

  const folderRes = await driveRequest('Drive folder', () =>
    drive.files.create({
      resource: {
        name: 'Backups',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      fields: 'id',
    })
  );

  return folderRes.data.id;
}

export async function uploadBackupFile(fileName, content) {
  const drive = getDriveClient();
  const folderId = await createBackupFolder();

  const res = await driveRequest('Drive folder', () =>
    drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(content),
      },
      fields: 'id, name, webViewLink',
    })
  );

  return res.data;
}