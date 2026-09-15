import { useState } from 'react'
import { createRsvp, RSVP_STATUS } from '../services/rsvp.js'

const OPTIONS = [
  { value: RSVP_STATUS.YES, label: 'Oui, je serai présent(e)', emoji: '✅' },
  { value: RSVP_STATUS.MAYBE, label: 'Peut-être', emoji: '🤔' },
  { value: RSVP_STATUS.NO, label: 'Non, je ne pourrai pas venir', emoji: '❌' },
]

export default function RsvpForm({ eventId, onSubmitted }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !status) {
      setError('Indique ton nom et choisis une réponse.')
      return
    }

    try {
      const rsvp = createRsvp(eventId, { name, status, message })
      setSubmitted(true)
      onSubmitted?.(rsvp)
    } catch (submissionError) {
      setError(submissionError.message || 'Impossible d’enregistrer ta réponse.')
    }
  }

  if (submitted) {
    return (
      <div className="cl-rsvp-success" role="status">
        <strong>Merci, ta réponse est enregistrée. ❤️</strong>
        <span>Tu peux fermer cette page ou la partager à nouveau.</span>
      </div>
    )
  }

  return (
    <form className="cl-form cl-rsvp-form" onSubmit={handleSubmit}>
      <label>
        Ton nom
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Marie" maxLength={80} />
      </label>

      <fieldset>
        <legend>Ta réponse</legend>
        <div className="cl-rsvp-options">
          {OPTIONS.map((option) => (
            <label className={`cl-rsvp-option ${status === option.value ? 'is-selected' : ''}`} key={option.value}>
              <input type="radio" name="rsvp-status" value={option.value} checked={status === option.value} onChange={(event) => setStatus(event.target.value)} />
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        Un message <span className="cl-muted">(facultatif)</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Un petit mot pour l’organisateur…" maxLength={300} rows={3} />
      </label>

      {error && <p className="cl-error" role="alert">{error}</p>}
      <button className="cl-primary-button" type="submit">Envoyer ma réponse</button>
    </form>
  )
}
