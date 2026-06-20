import * as dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceKey: required('SUPABASE_SERVICE_KEY'),
  idealistApiKey: process.env['IDEALIST_API_KEY'] ?? '',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
};
