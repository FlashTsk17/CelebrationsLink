import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405)
  try {
    const { slug, token } = await req.json()
    if (!slug || !token) return json({ error: 'Lien de gestion invalide.' }, 400)
    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceKey) return json({ error: 'Configuration serveur Supabase manquante.' }, 500)
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const hash = await sha256(token)
    const { data: event, error } = await admin.from('events').select('id,slug,mode,type,title,description,host,date,time,location,cover,template,status,created_at').eq('slug', slug).eq('management_token_hash', hash).maybeSingle()
    if (error) throw error
    if (!event) return json({ error: 'Lien de gestion invalide ou expiré.' }, 401)
    const { data: guests, error: guestsError } = await admin.from('guests').select('id,event_id,name,status,message,created_at').eq('event_id', event.id).order('created_at', { ascending: false })
    if (guestsError) throw guestsError
    return json({ event, guests: guests || [] })
  } catch (error) {
    console.error(error)
    return json({ error: 'Impossible de charger l’espace organisateur.' }, 500)
  }
})
