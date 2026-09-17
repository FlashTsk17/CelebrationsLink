import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEventBySlug } from '../services/eventService.js'
import { createRsvp, RSVP_STATUS } from '../services/rsvp.js'
import { getEventType } from '../data/eventTypes.js'

export default function PublicEvent() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(RSVP_STATUS.YES)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')

    getEventBySlug(slug)
      .then((data) => {
        if (active) setEvent(data)
      })
      .catch(() => {
        if (active) setLoadError('Impossible de charger cet événement. Vérifie ta connexion puis réessaie.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  const type = useMemo(() => getEventType(event?.type), [event?.type])

  if (loading) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Chargement de l’événement…</p></section></div></main>
  }

  if (loadError) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Un problème est survenu</h1><p>{loadError}</p></section></div></main>
  }

  if (!event) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Événement introuvable</h1><p>Ce lien n’existe pas ou cet événement n’est plus disponible.</p></section></div></main>
  }

  const submitRsvp = async (submitEvent) => {
    submitEvent.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Indique ton nom pour confirmer ta présence.')
      return
    }

    setSubmitting(true)
    try {
      await createRsvp(event.id, { name, status, message })
      setSubmitted(true)
    } catch {
      setError('Impossible d’enregistrer ta réponse. Vérifie ta connexion puis réessaie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-public-event">
          <div className="cl-public-event__badge">{event.mode === 'invitation' ? '💌 Invitation' : '📢 Annonce'}</div>
          <div className="cl-public-event__emoji">{type?.emoji || '✨'}</div>
          <h1>{event.title}</h1>
          {event.description && <p className="cl-public-event__description">{event.description}</p>}
          <p>Organisé par <strong>{event.host}</strong></p>
          {event.date && <div className="cl-public-event__details"><span>📅 {event.date}</span>{event.time && <span>🕐 {event.time}</span>}{event.location && <span>📍 {event.location}</span>}</div>}

          {event.mode === 'invitation' && (
            submitted ? (
              <div className="cl-rsvp-success" role="status">
                <strong>Merci, ta réponse est enregistrée ! 🎉</strong>
                <span>{status === RSVP_STATUS.YES ? 'Nous comptons sur ta présence.' : status === RSVP_STATUS.MAYBE ? 'Ta réponse est notée comme peut-être.' : 'Ta réponse est notée comme indisponible.'}</span>
              </div>
            ) : (
              <form className="cl-rsvp" onSubmit={submitRsvp}>
                <div className="cl-rsvp__heading">
                  <h2>Tu seras présent(e) ?</h2>
                  <p>Réponds à l’organisateur en quelques secondes.</p>
                </div>
                <label>Ton nom<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Marie Dupont" autoComplete="name" required /></label>
                <div className="cl-rsvp__choices" role="group" aria-label="Réponse à l'invitation">
                  <button type="button" className={status === RSVP_STATUS.YES ? 'is-selected' : ''} onClick={() => setStatus(RSVP_STATUS.YES)}>✅ Oui</button>
                  <button type="button" className={status === RSVP_STATUS.MAYBE ? 'is-selected' : ''} onClick={() => setStatus(RSVP_STATUS.MAYBE)}>🤔 Peut-être</button>
                  <button type="button" className={status === RSVP_STATUS.NO ? 'is-selected' : ''} onClick={() => setStatus(RSVP_STATUS.NO)}>❌ Non</button>
                </div>
                <label>Message <span>(facultatif)</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Un petit mot pour l’organisateur…" rows="3" /></label>
                {error && <p className="cl-form-error" role="alert">{error}</p>}
                <button className="cl-primary-button" type="submit" disabled={submitting}>{submitting ? 'Envoi…' : 'Envoyer ma réponse'}</button>
              </form>
            )
          )}

          <p className="cl-footer">Créé avec CélébrationsLink ❤️</p>
        </section>
      </div>
    </main>
  )
}
