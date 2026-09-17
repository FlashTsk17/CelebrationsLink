import { supabase, isSupabaseConfigured } from './supabase.js'

export async function createBasicEvent(input) {
  if (!isSupabaseConfigured) throw new Error('Supabase doit être configuré pour publier un événement en ligne.')
  const { data, error } = await supabase.functions.invoke('create-basic-event', { body: input })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export async function loadBasicEvent(slug, managementToken) {
  if (!isSupabaseConfigured) throw new Error('Supabase doit être configuré pour gérer un événement en ligne.')
  const { data, error } = await supabase.functions.invoke('manage-basic-event', {
    body: { slug, token: managementToken },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
