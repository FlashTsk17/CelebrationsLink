import { supabase, isSupabaseConfigured } from './supabase.js'

export const MEDIA_BUCKET = 'celebration-media'
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_CELEBRATION_IMAGES = 5

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function safeExtension(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg'
}

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'Choisis une image.' }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return { valid: false, error: 'Format image non pris en charge. Utilise JPG, PNG, WEBP ou GIF.' }
  if (file.size > MAX_IMAGE_BYTES) return { valid: false, error: 'Chaque image doit faire 8 Mo maximum.' }
  return { valid: true }
}

export async function uploadImageFile(file) {
  const validation = validateImageFile(file)
  if (!validation.valid) throw new Error(validation.error)
  if (!isSupabaseConfigured || !supabase) throw new Error('Le stockage cloud des photos nécessite Supabase et un compte Membre.')

  const { data: { user } = {} } = await supabase.auth.getUser()
  if (!user) throw new Error('Connecte-toi à ton compte Membre pour enregistrer tes photos dans le cloud.')

  const path = `${user.id}/${crypto.randomUUID()}.${safeExtension(file)}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { path, url: data?.publicUrl || '', fileName: file.name, mimeType: file.type, size: file.size }
}

export async function removeImageFile(path) {
  if (!path || !supabase) return
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path])
  if (error) throw error
}
