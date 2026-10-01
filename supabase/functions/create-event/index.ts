import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

function slugify(value: string) {
  return String(value || 'evenement').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'evenement'
}
function createManagementToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: 'Configuration serveur Supabase manquante.' }, 500)

    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const authHeader = request.headers.get('Authorization')
    let userId: string | null = null
    if (authHeader?.startsWith('Bearer ')) {
      const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
      const { data } = await authClient.auth.getUser()
      userId = data.user?.id ?? null
    }

    const input = await request.json()
    const title = String(input.title || '').trim()
    const host = String(input.host || '').trim()
    const mode = input.mode === 'invitation' ? 'invitation' : 'announcement'
    const type = String(input.type || 'other')
    const description = String(input.description || '').trim()
    const location = String(input.location || '').trim()
    const date = input.date || null
    const time = input.time || null

    if (!title || !host) return json({ error: 'Le titre et l’organisateur sont obligatoires.' }, 400)
    if (mode === 'invitation' && (!date || !time || !location)) return json({ error: 'Une invitation nécessite une date, une heure et un lieu.' }, 400)

    const baseSlug = slugify(title)
    let event: Record<string, unknown> | null = null
    for (let index = 0; index < 100; index += 1) {
      const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`
      const { data, error } = await service.from('events').insert({
        slug, mode, type, title, description, host, date, time, location,
        cover: String(input.cover || ''), template: String(input.template || 'default'),
        status: 'published', owner_id: userId,
      }).select('id,slug,mode,type,title,description,host,date,time,location,cover,template,status,owner_id,created_at').single()
      if (!error) { event = data; break }
      if (error.code !== '23505') throw error
    }
    if (!event) return json({ error: 'Impossible de générer un lien unique. Réessaie.' }, 409)

    if (!userId) {
      const managementToken = createManagementToken()
      const tokenHash = await sha256(managementToken)
      const { error: secretError } = await service.from('event_management_secrets').insert({ event_id: event.id, token_hash: tokenHash })
      if (secretError) {
        await service.from('events').delete().eq('id', event.id)
        throw secretError
      }
      return json({ event, managementToken, managementPath: `/organiser/manage?event=${encodeURIComponent(event.slug as string)}#token=${encodeURIComponent(managementToken)}` })
    }

    return json({ event, managementToken: null, managementPath: null })
  } catch (error) {
    console.error(error)
    return json({ error: 'Impossible de créer l’événement.' }, 500)
  }
})