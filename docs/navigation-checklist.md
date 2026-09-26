# D2.4 — Navigation E2E checklist

## Public
- `/` → `/organiser`
- `/` → `/celebrer`
- `/` → `/membre`
- `/` → `/premium`
- `/c/:slug` remains publicly accessible
- `/e/:slug` remains publicly accessible

## Member
- Guest action requiring membership → contextual auth
- Signup/login preserves a safe `returnTo`
- Successful auth returns to the originating flow
- Invalid/external `returnTo` falls back safely
- Member session → `/membre/espace`

## Premium
- Member → `/premium`
- Premium request remains associated with the authenticated user
- Premium-only feature stays gated until active status + valid expiry

## Studio
- `/celebrer` → type → personalization → publication → public celebration
- Access gates do not block basic creation unnecessarily
- Member-only actions route to auth with context
- Premium-only actions route to Premium with context

## Public result
- Published celebration opens without member authentication
- Music/photos/rendering remain available according to publication data
