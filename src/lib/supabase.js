import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

const PUBLIC_COLUMNS = 'id, city, street, property_type, rooms, area, created_at';

export async function fetchPublishedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(PUBLIC_COLUMNS)
    .eq('is_published', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function submitLead({ propertyId, fullName, phone, email, message }) {
  const { error } = await supabase.from('leads').insert({
    property_id: propertyId ?? null,
    full_name: fullName,
    phone,
    email: email || null,
    message: message || null,
  });
  if (error) throw error;
}
