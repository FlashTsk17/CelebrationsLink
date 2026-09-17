import { createId, readLocal, saveLocal } from './storage.js'
import { isSupabaseConfigured, supabase } from './supabase.js'

const RSVP_PREFIX = 'rsvp:'

export const RSVP_STATUS = {
  YES: 'yes',
  MAYBE: 'maybe',
  NO: 'no',
}

function validate({ eventId, name, status }) {
  const cleanName = name?.trim()
  if (!eventId || !cleanName || !Object.values(RSVP_STATUS).includes(status)) {
    throw new Error('Informations RSVP invalides.')
  }
  return cleanName
}

export async function createRsvp(eventId, { name, status, message = '' }) {
  const cleanName = validate({ eventId, name, status })

  if (!isSupabaseConfigured) {
    const rsvp = {
      id: createId(),
      eventId,
      name: cleanName,
      status,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    }
    const current = readLocal(`${RSVP_PREFIX}${eventId}`, [])
    saveLocal(`${RSVP_PREFIX}${eventId}`, [rsvp, ...current])
    return rsvp
  }

  const { data, error } = await supabase
    .from('guests')
    .insert({ event_id: eventId, name: cleanName, status, message: message.trim() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listRsvps(eventId) {
  if (!eventId) return []
  if (!isSupabaseConfigured) return readLocal(`${RSVP_PREFIX}${eventId}`, [])

  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function getRsvpSummary(eventId) {
  return listRsvps(eventId).then((rsvps) =>
    rsvps.reduce(
      (summary, rsvp) => {
        summary.total += 1
        summary[rsvp.status] = (summary[rsvp.status] || 0) + 1
        return summary
      },
      { total: 0, yes: 0, maybe: 0, no: 0 },
    ),
  )
}
