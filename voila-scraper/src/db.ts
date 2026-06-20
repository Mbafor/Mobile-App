import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import type { OpportunityRecord } from './types';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

export async function checkDuplicate(applyUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id')
    .eq('apply_url', applyUrl)
    .maybeSingle();

  if (error) throw new Error(`DB duplicate check failed: ${error.message}`);
  return data !== null;
}

export async function saveOpportunity(opp: OpportunityRecord): Promise<void> {
  const { error } = await supabase
    .from('opportunities')
    .upsert(opp, { onConflict: 'apply_url', ignoreDuplicates: true });

  if (error) throw new Error(`DB save failed: ${error.message}`);
}

export async function expirePastOpportunities(): Promise<void> {
  const { error } = await supabase.rpc('expire_past_opportunities');
  if (error) throw new Error(`expire_past_opportunities RPC failed: ${error.message}`);
}
