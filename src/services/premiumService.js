import { isSupabaseConfigured, supabase } from './supabase.js'

export async function createPremiumRequest(message = '') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Le service Premium n’est pas encore configuré.')
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) throw new Error('Connecte-toi à ton compte Membre pour demander Premium.')

  const { data: existing, error: existingError } = await supabase
    .from('premium_requests')
    .select('id,status,requested_at')
    .eq('user_id', user.id)
    .in('status', ['pending', 'contacted', 'payment_pending'])
    .limit(1)

  if (existingError) throw existingError
  if (existing?.length) return existing[0]

  const { data, error } = await supabase
    .from('premium_requests')
    .insert({ user_id: user.id, customer_message: message.trim() })
    .select('id,status,requested_at')
    .single()
  if (error) throw error
  return data
}

export async function getMyPremiumRequest() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return null
  const { data, error } = await supabase
    .from('premium_requests')
    .select('id,status,customer_message,requested_at,processed_at')
    .eq('user_id', auth.user.id)
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getMyProfile() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name,access_level,premium_status,premium_activated_at,premium_expires_at')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (error) throw error
  return data
}
