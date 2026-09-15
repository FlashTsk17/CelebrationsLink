import { createId, readLocal, saveLocal } from './storage.js'

const RSVP_PREFIX = 'rsvp:'

export const RSVP_STATUS = {
  YES: 'yes',
  MAYBE: 'maybe',
  NO: 'no',
}

export function createRsvp(eventId, { name, status, message = '' }) {
  const cleanName = name?.trim()
  if (!eventId || !cleanName || !Object.values(RSVP_STATUS).includes(status)) {
    throw new Error('Informations RSVP invalides.')
  }

  const rsvp = {
    id: createId(),
    eventId,
    name: cleanName,
    status,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  }

  const current = readLocal(`${RSVP_PREFIX}${eventId}`, [])
  const next = [rsvp, ...current]
  saveLocal(`${RSVP_PREFIX}${eventId}`, next)
  return rsvp
}

export function listRsvps(eventId) {
  return readLocal(`${RSVP_PREFIX}${eventId}`, [])
}

export function getRsvpSummary(eventId) {
  return listRsvps(eventId).reduce(
    (summary, rsvp) => {
      summary.total += 1
      summary[rsvp.status] = (summary[rsvp.status] || 0) + 1
      return summary
    },
    { total: 0, yes: 0, maybe: 0, no: 0 },
  )
}
