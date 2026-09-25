import { canUsePremium, PREMIUM_FEATURES } from './premiumAccess.js'

export async function resolveFeatureAccess(feature) {
  const premium = await canUsePremium(feature)
  return {
    ...premium,
    requiresPremium: Object.values(PREMIUM_FEATURES).includes(feature),
  }
}

export async function guardPremiumFeature(feature) {
  const access = await resolveFeatureAccess(feature)
  return access.requiresPremium ? access : { ...access, allowed: true }
}
