import { createId, readLocal, saveLocal, buildPublicPath } from './storage.js'
import { isSupabaseConfigured, supabase } from './supabase.js'

const EVENTS_KEY = 'events'

function slugify(value) {
  return String(value || 'evenement')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'evenement'
}

function uniqueSlug(base, events) {
  const root = slugify(base)
  let slug = root
  let index = 2
  while (events.some((event) => event.slug === slug)) slug = `${root}-${index++}`
  return slug
}

function toLocalEvent(input, events) {
  return {
    id: createId(),
    slug: uniqueSlug(input.title, events),
    mode: input.mode,
    type: input.type,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    host: input.host?.trim() || '',
    date: input.date || '',
    time: input.time || '',
    location: input.location?.trim() || '',
    cover: input.cover || '',
    template: input.template || 'default',
    status: 'published',
    owner_id: null,
    created_at: new Date().toISOString(),
  }
}

export async function createEvent(input) {
  if (!isSupabaseConfigured) {
    const events = readLocal(EVENTS_KEY, [])
    const event = toLocalEvent(input, events)
    saveLocal(EVENTS_KEY, [...events, event])
    return { ...event, managementToken: null, managementPath: null }
  }

  const { data, error } = await supabase.functions.invoke('create-basic-event', {
    body: {
      title: input.title,
      host: input.host,
      description: input.description,
      date: input.date,
      time: input.time,
      location: input.location,
      cover: input.cover,
      template: input.template,
      type: input.type,
      mode: input.mode,
    },
  })

  if (error) throw error
  if (!data?.event) throw new Error(data?.error || 'Impossible de créer l’événement.')
  return data
}

export async function listMyEvents() {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('events')
    .select('id, slug, mode, type, title, description, host, date, time, location, cover, template, status, owner_id, created_at')
    .eq('owner_id', (await supabase.auth.getUser()).data.user?.id || '')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getEventBySlug(slug) {
  if (!isSupabaseConfigured) {
    return readLocal(EVENTS_KEY, []).find((event) => event.slug === slug) || null
  }

  const { data, error } = await supabase
    .from('events')
    .select('id, slug, mode, type, title, description, host, date, time, location, cover, template, status, owner_id, created_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  return data
}

export function getEventPublicPath(event) {
  return buildPublicPath('event', event.slug)
}
