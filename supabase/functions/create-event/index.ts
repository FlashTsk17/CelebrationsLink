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

function slugify(value: string) {
  return String(value || 'evenement')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'evenement'
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const service = createClient(supabaseUrl, serviceRoleKey)
    const authHeader = request.headers.get('Authorization')
    let userId: string | null = null

    if (authHeader) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data } = await authClient.auth.getUser()
      userId = data.user?.id ?? null
    }

    const input = await request.json()
    const title = String(input.title || '').trim()
    const host = String(input.host || '').trim()
    const mode = input.mode === 'invitation' ? 'invitation' : 'announcement'
    const type = String(input.type || 'other')

    if (!title || !host) return json({ error: 'Le titre et l’organisateur sont obligatoires.' }, 400)
    if (mode === 'invitation' && (!input.date || !input.time || !String(input.location || '').trim())) {
      return json({ error: 'Une invitation nécessite une date, une heure et un lieu.' }, 400)
    }

    const baseSlug = slugify(title)
    let slug = baseSlug
    for (let index = 2; index <= 100; index += 1) {
      const { data: existing, error: lookupError } = await service
        .from('events')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (lookupError) throw lookupError
      if (!existing) break
      slug = `${baseSlug}-${index}`
      if (index === 100) return json({ error: 'Impossible de générer un lien unique.' }, 409)
    }

    const managementToken = userId ? null : createManagementToken()
    const managementTokenHash = managementToken ? await sha256(managementToken) : null

    const payload = {
      slug,
      mode,
      type,
      title,
      description: String(input.description || '').trim(),
      host,
      date: input.date || null,
      time: input.time || null,
      location: String(input.location || '').trim(),
      cover: String(input.cover || ''),
      template: String(input.template || 'default'),
      status: 'published',
      owner_id: userId,
      management_token_hash: managementTokenHash,
    }

    const { data, error } = await service.from('events').insert(payload).select().single()
    if (error) throw error

    return json({
      event: data,
      managementToken,
      managementPath: managementToken ? `/organiser/manage#token=${managementToken}` : null,
    }, 201)
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Impossible de créer l’événement.' }, 500)
  }
})
