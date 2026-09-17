import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const OPEN_STATUSES = ['pending', 'contacted', 'payment_pending']

function normalizeExpiry(value: unknown) {
  if (value === null || value === '' || typeof value === 'undefined') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null
  return date.toISOString()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405)

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const authHeader = req.headers.get('Authorization')
    if (!url || !serviceKey || !anonKey || !authHeader) return json({ error: 'Authentification serveur incomplète.' }, 401)

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Session invalide.' }, 401)

    const adminIds = (Deno.env.get('PREMIUM_ADMIN_USER_IDS') || '')
      .split(',').map((id) => id.trim()).filter(Boolean)
    if (!adminIds.includes(user.id)) return json({ error: 'Accès administrateur refusé.' }, 403)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const body = await req.json().catch(() => ({}))
    const action = body.action || 'list'

    if (action === 'list') {
      const { data: requests, error } = await admin
        .from('premium_requests')
        .select('id,user_id,offer,status,customer_message,admin_notes,requested_at,processed_at,processed_by')
        .order('requested_at', { ascending: false })
      if (error) throw error

      const enriched = await Promise.all((requests || []).map(async (request) => {
        const { data: authData } = await admin.auth.admin.getUserById(request.user_id)
        const { data: profile } = await admin
          .from('profiles')
          .select('display_name,access_level,premium_status,premium_activated_at,premium_expires_at')
          .eq('id', request.user_id)
          .maybeSingle()
        return {
          ...request,
          email: authData?.user?.email || '',
          display_name: profile?.display_name || authData?.user?.user_metadata?.display_name || '',
          access_level: profile?.access_level || 'member',
          premium_status: profile?.premium_status || 'inactive',
          premium_expires_at: profile?.premium_expires_at || null,
        }
      }))
      return json({ requests: enriched })
    }

    if (action === 'activate') {
      const { requestId, expiresAt = null, note = '' } = body
      if (!requestId) return json({ error: 'Demande Premium manquante.' }, 400)

      const normalizedExpiry = normalizeExpiry(expiresAt)
      if (expiresAt && !normalizedExpiry) return json({ error: 'Date d’expiration invalide.' }, 400)

      const { data: request, error: requestError } = await admin
        .from('premium_requests').select('id,user_id,status').eq('id', requestId).single()
      if (requestError) throw requestError
      if (!OPEN_STATUSES.includes(request.status)) {
        return json({ error: 'Cette demande n’est plus activable dans son état actuel.' }, 409)
      }

      const { data: profile, error: profileReadError } = await admin
        .from('profiles').select('id,access_level,premium_status').eq('id', request.user_id).single()
      if (profileReadError) throw profileReadError
      if (profile.access_level === 'premium' && profile.premium_status === 'active') {
        return json({ error: 'Ce membre dispose déjà d’un Premium actif.' }, 409)
      }

      const now = new Date().toISOString()
      const { error: profileError } = await admin
        .from('profiles')
        .update({
          access_level: 'premium',
          premium_status: 'active',
          premium_activated_at: now,
          premium_expires_at: normalizedExpiry,
          updated_at: now,
        })
        .eq('id', request.user_id)
      if (profileError) throw profileError

      const { error: requestUpdateError } = await admin
        .from('premium_requests')
        .update({
          status: 'approved',
          processed_at: now,
          processed_by: user.id,
          admin_notes: String(note || '').trim(),
        })
        .eq('id', request.id)
        .in('status', OPEN_STATUSES)
      if (requestUpdateError) throw requestUpdateError

      return json({ ok: true })
    }

    if (action === 'reject') {
      const { requestId, note = '' } = body
      if (!requestId) return json({ error: 'Demande Premium manquante.' }, 400)
      const now = new Date().toISOString()
      const { error } = await admin
        .from('premium_requests')
        .update({ status: 'rejected', processed_at: now, processed_by: user.id, admin_notes: String(note || '').trim() })
        .eq('id', requestId)
        .in('status', OPEN_STATUSES)
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'update_status') {
      const { requestId, status, note = '' } = body
      const allowed = ['contacted', 'payment_pending', 'cancelled']
      if (!requestId || !allowed.includes(status)) return json({ error: 'Statut Premium invalide.' }, 400)
      const now = new Date().toISOString()
      const { error } = await admin
        .from('premium_requests')
        .update({ status, admin_notes: String(note || '').trim(), processed_at: now, processed_by: user.id })
        .eq('id', requestId)
        .in('status', OPEN_STATUSES)
      if (error) throw error
      return json({ ok: true })
    }

    return json({ error: 'Action Premium inconnue.' }, 400)
  } catch (error) {
    console.error(error)
    return json({ error: error?.message || 'Erreur serveur.' }, 500)
  }
})
