import { createId, readLocal, saveLocal, buildPublicPath } from './storage.js'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { getMusicPlaybackUrl } from './musicEngine.js'

const CELEBRATIONS_KEY = 'celebrations'

function slugify(value) {
  return String(value || 'celebration').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'celebration'
}

function uniqueSlug(base, celebrations) {
  const root = slugify(base)
  let slug = root
  let index = 2
  while (celebrations.some((item) => item.slug === slug)) slug = `${root}-${index++}`
  return slug
}

function buildCelebration(input, id, slug) {
  return {
    id,
    slug,
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
    owner_id: input.owner_id || null,
    created_at: new Date().toISOString(),
  }
}

export async function createCelebration(input) {
  const { data: { user } = {} } = supabase ? await supabase.auth.getUser() : { data: {} }
  const shouldCloudSave = Boolean(isSupabaseConfigured && supabase && user && input.persistence === 'cloud')

  if (shouldCloudSave) {
    const { data, error } = await supabase.from('celebrations').insert({
      slug: `${slugify(input.title || input.recipient || input.occasion)}-${createId().slice(0, 8)}`,
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
      owner_id: user.id,
    }).select('*').single()
    if (error) throw error
    return data
  }

  const celebrations = readLocal(CELEBRATIONS_KEY, [])
  const celebration = buildCelebration(input, createId(), uniqueSlug(input.title || input.recipient || input.occasion, celebrations))
  saveLocal(CELEBRATIONS_KEY, [...celebrations, celebration])
  return celebration
}

export function getCelebrationBySlug(slug) {
  return readLocal(CELEBRATIONS_KEY, []).find((item) => item.slug === slug) || null
}

export async function getCelebrationBySlugAsync(slug) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('celebrations').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
    if (error) throw error
    if (data) {
      if (data.music?.storage === 'supabase' && data.music.storagePath) {
        try { data.music.src = await getMusicPlaybackUrl(data.music) } catch { data.music.src = null }
      }
      return data
    }
  }
  return getCelebrationBySlug(slug)
}

export function listCelebrations() {
  return readLocal(CELEBRATIONS_KEY, [])
}

export function getCelebrationPublicPath(celebration) {
  return buildPublicPath('celebration', celebration.slug)
}
