import { createId, readLocal, saveLocal, buildPublicPath } from './storage.js'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { getMusicPlaybackUrl } from './musicEngine.js'
import { getImagePlaybackUrl } from './mediaStorage.js'

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
  const base = input.title || input.recipient || input.occasion
  const localCelebrations = readLocal(CELEBRATIONS_KEY, [])
  const generatedSlug = `${slugify(base)}-${createId().slice(0, 8)}`

  if (shouldCloudSave) {
    const { data, error } = await supabase.from('celebrations').insert({
      slug: generatedSlug,
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
    }).select('id,slug,occasion,recipient,sender,title,message,photos,music,template,animations,status,created_at').single()
    if (error) throw error
    return data
  }

  const celebration = buildCelebration(input, createId(), uniqueSlug(base, localCelebrations))
  saveLocal(CELEBRATIONS_KEY, [...localCelebrations, celebration])
  return celebration
}

export function getCelebrationBySlug(slug) {
  return readLocal(CELEBRATIONS_KEY, []).find((item) => item.slug === slug) || null
}

export async function getCelebrationBySlugAsync(slug) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('celebrations').select('id,slug,occasion,recipient,sender,title,message,photos,music,template,animations,status,created_at').eq('slug', slug).eq('status', 'published').maybeSingle()
    if (error) throw error
    if (data) {
      const celebration = { ...data, music: data.music ? { ...data.music } : null }
      if (Array.isArray(celebration.photos)) {
        celebration.photos = await Promise.all(celebration.photos.map(async (photo) => {
          if (photo?.storage === 'supabase' && photo.storagePath) {
            try { return { ...photo, src: await getImagePlaybackUrl(photo.storagePath) } } catch { return { ...photo, src: null } }
          }
          return photo
        }))
      }
      if (celebration.music?.storage === 'supabase' && celebration.music.storagePath) {
        try { celebration.music.src = await getMusicPlaybackUrl(celebration.music) } catch { celebration.music.src = null }
      }
      return celebration
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
