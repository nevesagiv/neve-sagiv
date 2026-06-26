// Lightweight admin auth using sessionStorage.
// This is a TEMPORARY mock — when Supabase is wired, replace with proper Supabase Auth.

const STORAGE_KEY = 'shlomo-adiv-admin-session';
// TODO: replace with real Supabase Auth. For local dev only.
const DEV_PASSWORD = 'demo1234';

export function isAuthenticated() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export async function login(password) {
  // Simulate async behavior so the UI mirrors real Supabase calls
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (password === DEV_PASSWORD) {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'authenticated');
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

export function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
