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

export async function updateBasicEvent(slug, managementToken, payload) {
  return manageBasicEvent(slug, managementToken, 'update', payload)
}

export async function updateBasicEventStatus(slug, managementToken, status) {
  return manageBasicEvent(slug, managementToken, 'status', { status })
}

export async function manageBasicEvent(slug, managementToken, action = 'read', payload = {}) {
  if (!isSupabaseConfigured) throw new Error('Supabase doit être configuré pour gérer un événement en ligne.')
  const { data, error } = await supabase.functions.invoke('manage-basic-event', {
    body: { slug, token: managementToken, action, payload },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
