import { getMyProfile } from './premiumService.js'

export const PREMIUM_FEATURES = Object.freeze({
  ADVANCED_TEMPLATES: 'advanced_templates',
  PREMIUM_MEDIA: 'premium_media',
  ADVANCED_CUSTOMIZATION: 'advanced_customization',
  PREMIUM_EXPERIENCE: 'premium_experience',
})

export async function getPremiumAccess() {
  const profile = await getMyProfile()
  if (!profile) return { isPremium: false, profile: null }

  const expiresAt = profile.premium_expires_at ? new Date(profile.premium_expires_at).getTime() : null
  const activeByDate = expiresAt == null || expiresAt > Date.now()
  const isPremium = profile.access_level === 'premium' && profile.premium_status === 'active' && activeByDate

  return { isPremium, profile }
}

export async function canUsePremium(feature) {
  const access = await getPremiumAccess()
  return { ...access, feature, allowed: access.isPremium }
}
