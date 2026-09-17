import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authentification requise.')

    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('Session invalide.')

    // Configure the trusted admin identity as a server secret, never as a client-side flag.
    const adminIds = (Deno.env.get('PREMIUM_ADMIN_USER_IDS') || '').split(',').map((id) => id.trim()).filter(Boolean)
    if (!adminIds.includes(user.id)) throw new Error('Accès administrateur refusé.')

    const admin = createClient(url, serviceKey)
    const body = await req.json()
    const action = body.action || 'list'

    if (action === 'list') {
      const { data, error } = await admin.from('premium_requests').select('id,user_id,offer,status,customer_message,admin_notes,requested_at,processed_at,processed_by').order('requested_at', { ascending: false })
      if (error) throw error
      return Response.json({ requests: data || [] }, { headers: corsHeaders })
    }

    if (action === 'activate') {
      const { requestId, expiresAt, note = '' } = body
      if (!requestId) throw new Error('Demande Premium manquante.')
      const { data: request, error: requestError } = await admin.from('premium_requests').select('id,user_id,status').eq('id', requestId).single()
      if (requestError) throw requestError
      if (['approved', 'cancelled', 'rejected'].includes(request.status)) throw new Error('Cette demande ne peut plus être activée.')
      const now = new Date().toISOString()
      const { error: profileError } = await admin.from('profiles').update({ access_level: 'premium', premium_status: 'active', premium_activated_at: now, premium_expires_at: expiresAt || null, updated_at: now }).eq('id', request.user_id)
      if (profileError) throw profileError
      const { error: requestUpdateError } = await admin.from('premium_requests').update({ status: 'approved', processed_at: now, processed_by: user.id, admin_notes: note }).eq('id', request.id)
      if (requestUpdateError) throw requestUpdateError
      return Response.json({ ok: true }, { headers: corsHeaders })
    }

    if (action === 'reject') {
      const { requestId, note = '' } = body
      if (!requestId) throw new Error('Demande Premium manquante.')
      const now = new Date().toISOString()
      const { error } = await admin.from('premium_requests').update({ status: 'rejected', processed_at: now, processed_by: user.id, admin_notes: note }).eq('id', requestId)
      if (error) throw error
      return Response.json({ ok: true }, { headers: corsHeaders })
    }

    throw new Error('Action Premium inconnue.')
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur serveur.' }, { status: 400, headers: corsHeaders })
  }
})
