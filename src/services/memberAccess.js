export const MEMBER_LIMITS = {
  guestPublicCreations: 1,
  guestSavedItems: 0,
}

export function getGuestUsage() {
  try {
    return JSON.parse(localStorage.getItem('cl:guest-usage') || '{"publicCreations":0,"savedItems":0}')
  } catch {
    return { publicCreations: 0, savedItems: 0 }
  }
}

export function recordGuestPublicCreation() {
  const usage = getGuestUsage()
  usage.publicCreations += 1
  localStorage.setItem('cl:guest-usage', JSON.stringify(usage))
  return usage
}

export function shouldRequireMemberForGuestAction(action) {
  const usage = getGuestUsage()
  if (action === 'save') return true
  if (action === 'extra-public-creation') return usage.publicCreations >= MEMBER_LIMITS.guestPublicCreations
  return false
}

export function memberGatePath(returnTo = '/membre/espace', reason = 'member') {
  return `/membre?auth=signup&reason=${encodeURIComponent(reason)}&returnTo=${encodeURIComponent(returnTo)}`
}
