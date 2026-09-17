import { createId, readLocal, saveLocal, buildPublicPath } from './storage.js'

const CELEBRATIONS_KEY = 'celebrations'

function slugify(value) {
  return String(value || 'celebration')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'celebration'
}

function uniqueSlug(base, celebrations) {
  const root = slugify(base)
  let slug = root
  let index = 2
  while (celebrations.some((item) => item.slug === slug)) slug = `${root}-${index++}`
  return slug
}

export function createCelebration(input) {
  const celebrations = readLocal(CELEBRATIONS_KEY, [])
  const celebration = {
    id: createId(),
    slug: uniqueSlug(input.title || input.recipient || input.occasion, celebrations),
    occasion: input.occasion || 'other',
    recipient: input.recipient?.trim() || '',
    sender: input.sender?.trim() || '',
    title: input.title?.trim() || '',
    message: input.message?.trim() || '',
    photos: Array.isArray(input.photos) ? input.photos : [],
    music: input.music || null,
    template: input.template || 'classic',
    animations: input.animations !== false,
    status: 'published',
    created_at: new Date().toISOString(),
  }

  saveLocal(CELEBRATIONS_KEY, [...celebrations, celebration])
  return celebration
}

export function getCelebrationBySlug(slug) {
  return readLocal(CELEBRATIONS_KEY, []).find((item) => item.slug === slug) || null
}

export function listCelebrations() {
  return readLocal(CELEBRATIONS_KEY, [])
}

export function getCelebrationPublicPath(celebration) {
  return buildPublicPath('celebration', celebration.slug)
}
