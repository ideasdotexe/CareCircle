import { supabase } from './supabase';

/**
 * Always fetches the current user's display name fresh from Supabase.
 * Priority: profiles.full_name → profiles.first_name+last_name → user_metadata.full_name → fallback
 */
export async function fetchDisplayName(fallback = '') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { name: fallback, initials: '', email: '' };

  const { data: p } = await supabase
    .from('profiles')
    .select('full_name, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  const name =
    p?.full_name?.trim() ||
    `${p?.first_name || ''} ${p?.last_name || ''}`.trim() ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    fallback;

  const initials = name && name !== fallback
    ? name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
    : '';

  return { name, initials, email: user.email || '' };
}
