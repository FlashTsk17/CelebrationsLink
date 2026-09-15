import { createId, readLocal, saveLocal, buildPublicPath } from './storage.js'

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

export function createEvent(input) {
  const events = readLocal(EVENTS_KEY, [])
  const event = {
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
    created_at: new Date().toISOString(),
  }

  saveLocal(EVENTS_KEY, [...events, event])
  return event
}

export function getEventBySlug(slug) {
  return readLocal(EVENTS_KEY, []).find((event) => event.slug === slug) || null
}

export function getEventPublicPath(event) {
  return buildPublicPath('event', event.slug)
}
