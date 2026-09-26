import { getCurrentUser } from './auth.js'

const PUBLIC_PATHS = new Set(['/', '/organiser', '/organiser/type', '/organiser/annonce', '/organiser/invitation', '/celebrer', '/celebrer/type', '/celebrer/personnaliser', '/membre', '/premium'])

export function isSafeReturnPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
}

export function getReturnPath(path, fallback = '/') {
  return isSafeReturnPath(path) ? path : fallback
}

export function isPublicPath(pathname) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/c/') || pathname.startsWith('/e/') || pathname.startsWith('/birthday') || pathname.startsWith('/fete-meres')
}

export async function getNavigationContext() {
  const user = await getCurrentUser()
  return {
    user,
    isMember: Boolean(user),
    isPublic: true,
  }
}
