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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Configuration serveur Supabase manquante.' }, 500)

    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { token, action = 'read' } = await request.json()

    if (typeof token !== 'string' || token.length < 32) return json({ error: 'Jeton de gestion invalide.' }, 401)

    const tokenHash = await sha256(token)
    const { data: secret, error: secretError } = await service
      .from('event_management_secrets')
      .select('event_id')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle()

    if (secretError) throw secretError
    if (!secret) return json({ error: 'Lien de gestion invalide ou expiré.' }, 401)

    const { data: event, error: eventError } = await service
      .from('events')
      .select('id, slug, mode, type, title, description, host, date, time, location, cover, template, status, created_at')
      .eq('id', secret.event_id)
      .maybeSingle()

    if (eventError) throw eventError
    if (!event) return json({ error: 'Lien de gestion invalide ou expiré.' }, 401)

    if (action === 'read') return json({ event })

    if (action === 'rsvps') {
      if (event.mode !== 'invitation') return json({ event, rsvps: [] })
      const { data: rsvps, error: rsvpError } = await service
        .from('guests')
        .select('id, name, status, message, created_at')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
      if (rsvpError) throw rsvpError
      return json({ event, rsvps: rsvps || [] })
    }

    return json({ error: 'Action inconnue.' }, 400)
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Impossible de gérer cet événement.' }, 500)
  }
})
