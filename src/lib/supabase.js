import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ============================================================================
// PUBLIC (anonymous-readable)
// ============================================================================

const PUBLIC_COLUMNS = 'id, city, street, property_type, rooms, area_sqm, short_description, created_at';

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

// ============================================================================
// ADMIN (authenticated only — protected by Supabase RLS)
// ============================================================================

function deriveLeadStatus(row) {
  if (row.is_archived) return 'closed';
  if (row.contacted_at) return 'contacted';
  return 'new';
}

function adaptLead(row) {
  const prop = row.property;
  const cityHe = prop?.city?.he || '';
  const street = prop?.street || '';
  const typeHe = prop?.property_type?.he || '';
  const labelParts = [];
  if (typeHe) labelParts.push(typeHe);
  if (cityHe) labelParts.push(`ב${cityHe}`);
  if (street) labelParts.push(`רח׳ ${street}`);
  return {
    id: row.id,
    date: row.created_at?.slice(0, 10) || '',
    created_at: row.created_at,
    name: row.full_name,
    phone: row.phone,
    email: row.email || '',
    property_label: prop ? labelParts.join(' ') : '— ליד מדף נחיתה',
    status: deriveLeadStatus(row),
    message: row.message || '',
    trustee_name: prop?.trustee_name || '',
    trustee_phone: prop?.trustee_phone || '',
    is_read: row.is_read,
    contacted_at: row.contacted_at,
    notes: row.notes || '',
  };
}

export async function fetchAllLeadsAdmin() {
  // Two-step fetch (avoids PostgREST embed/FK detection issues):
  // 1) Fetch all leads
  const { data: leadsRows, error: leadsErr } = await supabase
    .from('leads')
    .select('id, full_name, phone, email, message, created_at, is_read, is_archived, contacted_at, notes, property_id')
    .order('created_at', { ascending: false });
  if (leadsErr) throw leadsErr;

  const leads = leadsRows ?? [];
  const propertyIds = [...new Set(leads.map((l) => l.property_id).filter(Boolean))];

  // 2) Fetch related properties (if any)
  let propsMap = {};
  if (propertyIds.length) {
    const { data: propsRows, error: propsErr } = await supabase
      .from('properties')
      .select('id, city, street, property_type, trustee_name, trustee_phone')
      .in('id', propertyIds);
    if (propsErr) throw propsErr;
    propsMap = Object.fromEntries((propsRows ?? []).map((p) => [p.id, p]));
  }

  return leads.map((row) => adaptLead({ ...row, property: propsMap[row.property_id] || null }));
}

export async function updateLeadStatus(leadId, status) {
  const patch = {};
  if (status === 'contacted') {
    patch.contacted_at = new Date().toISOString();
    patch.is_read = true;
    patch.is_archived = false;
  } else if (status === 'closed') {
    patch.is_archived = true;
    patch.is_read = true;
  } else if (status === 'new') {
    patch.contacted_at = null;
    patch.is_archived = false;
  }
  const { error } = await supabase.from('leads').update(patch).eq('id', leadId);
  if (error) throw error;
}

function adaptProperty(row) {
  const cityHe = row.city?.he || '';
  const cityRu = row.city?.ru || '';
  const typeHe = row.property_type?.he || '';
  const typeRu = row.property_type?.ru || '';
  return {
    id: row.id,
    is_published: row.is_published,
    address: row.full_address || '',
    city: cityHe,
    city_ru: cityRu,
    street: row.street || '',
    // PropertyFormModal uses `type` and `area`; expose both names
    type: typeHe,
    property_type: typeHe,
    type_ru: typeRu,
    rooms: row.rooms,
    area: row.area_sqm,
    area_sqm: row.area_sqm,
    block: row.block || '',
    parcel: row.parcel || '',
    sub_parcel: row.sub_parcel || '',
    trustee_name: row.trustee_name || '',
    trustee_phone: row.trustee_phone || '',
    submit_deadline: row.submit_deadline || '',
    short_description: row.short_description || '',
    internal_notes: row.internal_notes || '',
    status: row.status || 'active',
    added: row.created_at?.slice(0, 10) || '',
  };
}

export async function fetchAllPropertiesAdmin() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(adaptProperty);
}

export async function togglePropertyPublishedAdmin(id, newValue) {
  const { error } = await supabase
    .from('properties')
    .update({ is_published: newValue })
    .eq('id', id);
  if (error) throw error;
}

function dashboardShapeToDbRow(data) {
  const typeHe = data.property_type || data.type || '';
  const typeRu = data.type_ru || '';
  const areaVal = data.area_sqm ?? data.area;
  return {
    city: { he: data.city || '', ru: data.city_ru || '' },
    street: data.street || null,
    property_type: { he: typeHe, ru: typeRu },
    rooms: data.rooms === '' || data.rooms == null ? null : Number(data.rooms),
    area_sqm: areaVal === '' || areaVal == null ? null : Number(areaVal),
    full_address: data.address || null,
    block: data.block || null,
    parcel: data.parcel || null,
    sub_parcel: data.sub_parcel || null,
    trustee_name: data.trustee_name || null,
    trustee_phone: data.trustee_phone || null,
    submit_deadline: data.submit_deadline || null,
    short_description: data.short_description || null,
    internal_notes: data.internal_notes || null,
    is_published: data.is_published ?? false,
    status: data.status || 'active',
  };
}

export async function savePropertyAdmin(data) {
  const dbRow = dashboardShapeToDbRow(data);
  if (data.id) {
    const { error } = await supabase.from('properties').update(dbRow).eq('id', data.id);
    if (error) throw error;
    return data.id;
  }
  const { data: inserted, error } = await supabase
    .from('properties')
    .insert(dbRow)
    .select('id')
    .single();
  if (error) throw error;
  return inserted.id;
}

export async function deletePropertyAdmin(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}
