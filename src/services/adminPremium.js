import { supabase } from './supabase.js'

async function invoke(action, body = {}) {
  if (!supabase) throw new Error('Le service Premium n’est pas encore configuré.')
  const { data, error } = await supabase.functions.invoke('admin-premium', {
    body: { action, ...body },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export async function listPremiumRequests() {
  const { requests = [] } = await invoke('list')
  return requests
}

export async function activatePremium(requestId, expiresAt = null, note = '') {
  return invoke('activate', { requestId, expiresAt, note })
}

export async function rejectPremium(requestId, note = '') {
  return invoke('reject', { requestId, note })
}

export async function updatePremiumRequestStatus(requestId, status, note = '') {
  return invoke('update_status', { requestId, status, note })
}
