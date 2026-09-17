import { MUSIC_LIBRARY, getRecommendedMusic } from '../data/musicLibrary.js'
import { supabase, isSupabaseConfigured } from './supabase.js'

export const MAX_USER_MUSIC_BYTES = 15 * 1024 * 1024
export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/aac']
export const MUSIC_BUCKET = 'celebration-music'

export function getMusicForOccasion(occasion) {
  return getRecommendedMusic(occasion)
}

export function getAllLibraryMusic() {
  return MUSIC_LIBRARY
}

export function validateAudioFile(file) {
  if (!file) return { valid: false, error: 'Choisis un fichier audio.' }
  if (file.size > MAX_USER_MUSIC_BYTES) return { valid: false, error: 'La musique doit faire 15 Mo maximum.' }
  const extension = file.name.split('.').pop()?.toLowerCase()
  const validType = ACCEPTED_AUDIO_TYPES.includes(file.type) || ['mp3', 'm4a', 'wav', 'ogg', 'webm', 'aac'].includes(extension)
  if (!validType) return { valid: false, error: 'Format non pris en charge. Utilise MP3, M4A, WAV, OGG, WEBM ou AAC.' }
  return { valid: true }
}

export function createLocalMusicTrack(file) {
  const validation = validateAudioFile(file)
  if (!validation.valid) throw new Error(validation.error)
  return {
    id: `local-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ''),
    artist: 'Ma musique',
    category: 'custom',
    occasions: [],
    src: URL.createObjectURL(file),
    isLocal: true,
    fileName: file.name,
    size: file.size,
  }
}

export async function uploadMusicFile(file) {
  const validation = validateAudioFile(file)
  if (!validation.valid) throw new Error(validation.error)
  if (!isSupabaseConfigured || !supabase) {
    return { ...createLocalMusicTrack(file), storage: 'local' }
  }

  const { data: { user } = {} } = await supabase.auth.getUser()
  if (!user) throw new Error('Connecte-toi à ton compte Membre pour enregistrer une musique dans le cloud.')

  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp3'
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(MUSIC_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error

  const { data } = supabase.storage.from(MUSIC_BUCKET).getPublicUrl(path)
  return {
    id: `storage-${path}`,
    title: file.name.replace(/\.[^/.]+$/, ''),
    artist: 'Ma musique',
    category: 'custom',
    occasions: [],
    storage: 'supabase',
    storagePath: path,
    src: data?.publicUrl || '',
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  }
}

export async function getMusicPlaybackUrl(track) {
  if (!track) return null
  if (track.src) return track.src
  if (track.storage !== 'supabase' || !track.storagePath || !supabase) return null

  const { data } = supabase.storage.from(MUSIC_BUCKET).getPublicUrl(track.storagePath)
  return data?.publicUrl || null
}

export async function removeStoredMusic(track) {
  if (!track?.storagePath || !supabase) return
  const { error } = await supabase.storage.from(MUSIC_BUCKET).remove([track.storagePath])
  if (error) throw error
}
