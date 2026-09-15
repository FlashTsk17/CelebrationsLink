import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEventBySlug } from '../services/eventService.js'

export default function PublicEvent() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)

  useEffect(() => setEvent(getEventBySlug(slug)), [slug])

  if (!event) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Événement introuvable</h1><p>Ce lien n’existe pas ou cet événement n’est plus disponible.</p></section></div></main>
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-public-event">
          <div className="cl-public-event__badge">{event.mode === 'invitation' ? '💌 Invitation' : '📢 Annonce'}</div>
          <div className="cl-public-event__emoji">{event.type === 'birthday' ? '🎂' : '✨'}</div>
          <h1>{event.title}</h1>
          {event.description && <p className="cl-public-event__description">{event.description}</p>}
          <p>Organisé par <strong>{event.host}</strong></p>
          {event.date && <div className="cl-public-event__details"><span>📅 {event.date}</span>{event.time && <span>🕐 {event.time}</span>}{event.location && <span>📍 {event.location}</span>}</div>}
          {event.mode === 'invitation' && <button className="cl-primary-button" type="button" disabled>Je confirme ma présence · bientôt</button>}
          <p className="cl-footer">Créé avec CélébrationsLink ❤️</p>
        </section>
      </div>
    </main>
  )
}
