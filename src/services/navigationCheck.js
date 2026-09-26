import { getCurrentUser } from './auth.js'
import { isSafeReturnPath, isPublicPath } from './navigationPolicy.js'

export async function checkNavigation(pathname, options = {}) {
  const user = await getCurrentUser()
  const publicPath = isPublicPath(pathname)

  return {
    pathname,
    user,
    isMember: Boolean(user),
    isPublic: publicPath,
    canEnter: publicPath || Boolean(user) || options.allowGuest === true,
    returnTo: isSafeReturnPath(options.returnTo) ? options.returnTo : '/',
  }
}

export function navigationFailure(returnTo = '/') {
  return {
    type: 'navigation-failure',
    returnTo: isSafeReturnPath(returnTo) ? returnTo : '/',
  }
}
