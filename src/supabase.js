/**
 * AlbionCalculate — Supabase Client
 * Initialize and provide Supabase client for user data persistence
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zgdwnyzhvudbgreggbgx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLIC_KEY || '';

let supabase = null;

/**
 * Get or initialize Supabase client
 */
export function getSupabase() {
  if (!supabase && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true }
    });
  }
  return supabase;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  return !!SUPABASE_ANON_KEY;
}

// === Wishlist Operations ===

/**
 * Save an item to the wishlist
 */
export async function saveWishlistItem(item) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('wishlist')
    .upsert(item, { onConflict: 'item_id' });

  if (error) console.error('Wishlist save error:', error);
  return data;
}

/**
 * Get all wishlist items
 */
export async function getWishlistItems() {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('wishlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Wishlist fetch error:', error);
  return data || [];
}

/**
 * Remove a wishlist item
 */
export async function removeWishlistItem(itemId) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('wishlist')
    .delete()
    .eq('item_id', itemId);

  if (error) console.error('Wishlist delete error:', error);
  return data;
}

// === User Preferences ===

/**
 * Save user preferences
 */
export async function savePreferences(prefs) {
  const sb = getSupabase();
  if (!sb) {
    // Fallback to localStorage
    localStorage.setItem('albion_prefs', JSON.stringify(prefs));
    return prefs;
  }

  const { data, error } = await sb
    .from('user_preferences')
    .upsert(prefs, { onConflict: 'user_id' });

  if (error) {
    // Fallback to localStorage
    localStorage.setItem('albion_prefs', JSON.stringify(prefs));
  }
  return data;
}

/**
 * Get user preferences
 */
export function getPreferences() {
  const stored = localStorage.getItem('albion_prefs');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { /* ignore */ }
  }
  return {
    server: 'east',
    defaultCity: 'Caerleon',
    isPremium: true,
    focusSpec: 50
  };
}

/**
 * Save preferences to localStorage (always works)
 */
export function saveLocalPrefs(prefs) {
  localStorage.setItem('albion_prefs', JSON.stringify(prefs));
}
