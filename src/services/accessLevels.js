import { getCurrentUser } from './auth.js'
import { getMyProfile } from './premiumService.js'
import { getGuestUsage } from './memberAccess.js'

export const ACCESS_LEVELS = Object.freeze({
  GUEST: 'guest',
  MEMBER: 'member',
  PREMIUM: 'premium',
})

export async function getAccessLevel() {
  const user = await getCurrentUser()
  if (!user) return { level: ACCESS_LEVELS.GUEST, user: null, profile: null, usage: getGuestUsage() }

  const profile = await getMyProfile()
  const expiresAt = profile?.premium_expires_at ? new Date(profile.premium_expires_at).getTime() : null
  const active = profile?.access_level === 'premium' && profile?.premium_status === 'active' && (expiresAt == null || expiresAt > Date.now())
  return { level: active ? ACCESS_LEVELS.PREMIUM : ACCESS_LEVELS.MEMBER, user, profile: profile || null, usage: null }
}

export async function hasAccess(requiredLevel) {
  const { level, ...context } = await getAccessLevel()
  const rank = { guest: 0, member: 1, premium: 2 }
  return { ...context, level, allowed: rank[level] >= rank[requiredLevel] }
}
