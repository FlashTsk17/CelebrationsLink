const STORAGE_PREFIX = 'celebrationslink:'

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function saveLocal(key, value) {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  return value
}

export function readLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function removeLocal(key) {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
}

export function buildPublicPath(kind, slug) {
  return kind === 'celebration' ? `/c/${slug}` : `/e/${slug}`
}
