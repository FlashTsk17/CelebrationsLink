import { getCurrentUser } from './auth.js'
import { getPremiumAccess, PREMIUM_FEATURES } from './premiumAccess.js'
import { memberGatePath } from './memberAccess.js'

export async function getStudioAccess() {
  const user = await getCurrentUser()
  const premium = await getPremiumAccess()
  return {
    isMember: Boolean(user),
    isPremium: premium.isPremium,
    user,
    profile: premium.profile,
  }
}

export async function checkStudioAction(action, returnTo = '/celebrer/type') {
  const access = await getStudioAccess()
  if (action === 'cloud_media' || action === 'save_creation') {
    return access.isMember
      ? { allowed: true, ...access }
      : { allowed: false, reason: 'member_required', redirect: memberGatePath(returnTo, action), ...access }
  }

  if (Object.values(PREMIUM_FEATURES).includes(action)) {
    return access.isPremium
      ? { allowed: true, ...access }
      : { allowed: false, reason: 'premium_required', redirect: `/premium?feature=${encodeURIComponent(action)}&returnTo=${encodeURIComponent(returnTo)}`, ...access }
  }

  return { allowed: true, ...access }
}
