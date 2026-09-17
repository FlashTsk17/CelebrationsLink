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
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function slugify(value: string) {
  return String(value || 'evenement')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'evenement'
}

function token() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405)

  try {
    const body = await req.json()
    const title = String(body.title || '').trim()
    const host = String(body.host || '').trim()
    const mode = body.mode === 'invitation' ? 'invitation' : 'announcement'
    const type = String(body.type || 'other')
    const description = String(body.description || '').trim()
    const location = String(body.location || '').trim()
    const date = body.date || null
    const time = body.time || null

    if (!title || !host) return json({ error: 'Le titre et l’organisateur sont obligatoires.' }, 400)
    if (mode === 'invitation' && (!date || !time || !location)) {
      return json({ error: 'Une invitation doit avoir une date, une heure et un lieu.' }, 400)
    }

    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceKey) return json({ error: 'Configuration serveur Supabase manquante.' }, 500)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const managementToken = token()
    const managementTokenHash = await sha256(managementToken)
    const root = slugify(title)

    let event = null
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = attempt === 0 ? '' : `-${crypto.randomUUID().slice(0, 6)}`
      const slug = `${root}${suffix}`
      const { data, error } = await admin.from('events').insert({
        slug, mode, type, title, description, host, date, time, location,
        cover: String(body.cover || ''), template: String(body.template || 'default'),
        status: 'published', owner_id: null,
      }).select('id,slug,mode,type,title,description,host,date,time,location,cover,template,status,owner_id,created_at').single()
      if (!error) { event = data; break }
      if (error.code !== '23505') throw error
    }

    if (!event) return json({ error: 'Impossible de générer un lien unique. Réessaie.' }, 409)

    const { error: secretError } = await admin.from('event_management_secrets').insert({
      event_id: event.id,
      token_hash: managementTokenHash,
    })
    if (secretError) {
      await admin.from('events').delete().eq('id', event.id)
      throw secretError
    }

    return json({
      event,
      managementToken,
      managementPath: `/organiser/manage?event=${encodeURIComponent(event.slug)}#token=${encodeURIComponent(managementToken)}`,
    })
  } catch (error) {
    console.error(error)
    return json({ error: 'Impossible de créer l’événement.' }, 500)
  }
})
