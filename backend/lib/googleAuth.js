import { google } from 'googleapis';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let authClient = null;

export function getGoogleAuth() {
  if (authClient) return authClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID;

  const missing = [];
  if (!email || !String(email).trim()) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!rawPrivateKey || !String(rawPrivateKey).trim()) missing.push('GOOGLE_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Google Auth Error: Missing environment variables: ${missing.join(', ')}. ` +
      'Add them to your root .env file (dotenv loads it automatically). ' +
      'Never commit real credential values to source control.'
    );
  }

  const privateKey = String(rawPrivateKey).replace(/\\n/g, '\n');

  if (
    !privateKey.includes('-----BEGIN PRIVATE KEY-----') ||
    !privateKey.includes('-----END PRIVATE KEY-----')
  ) {
    throw new Error(
      'Google Auth Error: GOOGLE_PRIVATE_KEY is not a valid PEM private key. ' +
      "It must contain '-----BEGIN PRIVATE KEY-----' and '-----END PRIVATE KEY-----'. " +
      'In .env keep the value quoted with literal \\n line separators, for example: ' +
      'GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nabc...\\n-----END PRIVATE KEY-----\\n"'
    );
  }

  try {
    authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: String(email).trim(),
        private_key: privateKey,
      },
      projectId: projectId ? String(projectId).trim() : undefined,
      scopes: [DRIVE_SCOPE, SHEETS_SCOPE],
    });
  } catch (e) {
    throw new Error(`Google Auth Error: Could not create GoogleAuth client: ${e.message}`);
  }

  return authClient;
}