import { supabase, isSupabaseConfigured } from './supabase.js'

export const PREMIUM_BENEFITS = [
  'Modèles et designs Premium',
  'Animations avancées',
  'Musique et personnalisation enrichie',
  'Fonctionnalités IA',
  'Plus de médias et de stockage',
  'Statistiques et partage avancés',
]

export async function getMembership() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('profiles').select('id, display_name, access_level, premium_status, premium_activated_at, premium_expires_at').single()
  if (error) throw error
  return data
}

export async function requestPremium(message = '') {
  if (!supabase) throw new Error('Le service Premium n’est pas encore configuré.')
  const { data: { user } = {} } = await supabase.auth.getUser()
  if (!user) throw new Error('Connecte-toi à ton compte Membre avant de demander Premium.')
  const { data, error } = await supabase.from('premium_requests').insert({ user_id: user.id, customer_message: message.trim() }).select('id, status, requested_at').single()
  if (error) throw error
  return data
}

export async function listMyPremiumRequests() {
  if (!supabase) return []
  const { data, error } = await supabase.from('premium_requests').select('id, offer, status, customer_message, requested_at, processed_at').order('requested_at', { ascending: false })
  if (error) throw error
  return data || []
}
