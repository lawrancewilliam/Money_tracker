import { createClient } from '@supabase/supabase-js';

let client = null;
let cachedUrl = null;

function readConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL ||
    ''
  ).trim();

  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  return { url, key };
}

export function getProjectUrl() {
  return readConfig().url;
}

export function getSupabase() {
  if (client) return client;

  const { url, key } = readConfig();

  const missing = [];
  if (!url) missing.push('SUPABASE_URL (or PUBLIC_SUPABASE_URL)');
  if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY / PUBLIC_SUPABASE_ANON_KEY)');

  if (missing.length > 0) {
    throw new Error(
      `Supabase Error: Missing environment variables: ${missing.join(', ')}. ` +
      'Add them to your root .env file (dotenv loads it automatically) and to Vercel project settings. ' +
      'Run supabase/schema.sql in the Supabase SQL Editor first.'
    );
  }

  cachedUrl = url;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
