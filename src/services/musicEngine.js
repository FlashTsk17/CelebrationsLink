import { MUSIC_LIBRARY, getRecommendedMusic } from '../data/musicLibrary.js'

export const MAX_USER_MUSIC_BYTES = 15 * 1024 * 1024
export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/aac']

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
