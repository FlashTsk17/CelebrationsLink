import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getEventBySlug, getEventPublicPath } from '../services/eventService.js'
import { getRsvpSummary, listRsvps, RSVP_STATUS } from '../services/rsvp.js'
import { copyText, getAbsoluteUrl, shareLink } from '../services/share.js'
import { getEventType } from '../data/eventTypes.js'

const LABELS = {
  [RSVP_STATUS.YES]: 'Oui',
  [RSVP_STATUS.MAYBE]: 'Peut-être',
  [RSVP_STATUS.NO]: 'Non',
}

export default function OrganiserDashboard() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const slug = params.get('event')
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [summary, setSummary] = useState({ total: 0, yes: 0, maybe: 0, no: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [managementUrl, setManagementUrl] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (!slug) {
        setError('Aucun événement n’a été indiqué.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const loadedEvent = await getEventBySlug(slug)
        if (!loadedEvent) {
          if (active) setError('Impossible de trouver cet événement sur cet appareil.')
          return
        }

        const loadedRsvps = loadedEvent.mode === 'invitation' ? await listRsvps(loadedEvent.id) : []
        const loadedSummary = loadedEvent.mode === 'invitation'
          ? await getRsvpSummary(loadedEvent.id)
          : { total: 0, yes: 0, maybe: 0, no: 0 }

        if (active) {
          setEvent(loadedEvent)
          setRsvps(loadedRsvps)
          setSummary(loadedSummary)
        }
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Impossible de charger l’espace organisateur.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [slug])

  const type = useMemo(() => getEventType(event?.type), [event?.type])
  const filteredRsvps = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return rsvps.filter((rsvp) => {
      const matchesStatus = filter === 'all' || rsvp.status === filter
      const matchesQuery = !normalized || rsvp.name.toLowerCase().includes(normalized) || (rsvp.message || '').toLowerCase().includes(normalized)
      return matchesStatus && matchesQuery
    })
  }, [rsvps, filter, query])
  const publicUrl = event ? getAbsoluteUrl(getEventPublicPath(event)) : ''
  useEffect(() => {
    if (!event) return
    const token = sessionStorage.getItem(`cl:management-token:${event.slug}`)
    if (token) setManagementUrl(getAbsoluteUrl(`/organiser/manage?event=${encodeURIComponent(event.slug)}#token=${encodeURIComponent(token)}`))
  }, [event])

  async function handleCopy() {
    try {
      await copyText(publicUrl)
      setShareMessage('Lien copié ! Tu peux maintenant le partager où tu veux.')
    } catch {
      setShareMessage('Impossible de copier le lien automatiquement.')
    }
  }

  async function refreshRsvps() {
    if (!event || event.mode !== 'invitation') return
    setRefreshing(true)
    try {
      const [loadedRsvps, loadedSummary] = await Promise.all([listRsvps(event.id), getRsvpSummary(event.id)])
      setRsvps(loadedRsvps)
      setSummary(loadedSummary)
      setShareMessage('Réponses actualisées.')
    } catch (refreshError) {
      setShareMessage(refreshError?.message || 'Impossible d’actualiser les réponses.')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleShare() {
    try {
      const shared = await shareLink({
        title: event.title,
        text: event.mode === 'invitation' ? `Invitation : ${event.title}` : `Annonce : ${event.title}`,
        url: publicUrl,
      })
      if (shared) setShareMessage('Partage ouvert.')
      else await handleCopy()
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') setShareMessage('Le partage a été annulé ou n’est pas disponible.')
    }
  }

  if (loading) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Chargement de ton espace organisateur…</p></section></div></main>
  }

  if (error || !event) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel">
      <p className="cl-eyebrow">Espace organisateur</p>
      <h1>Événement introuvable</h1>
      <p>{error || 'Impossible de trouver cet événement.'}</p>
      <button className="cl-primary-button" type="button" onClick={() => navigate('/organiser')}>Créer un événement</button>
    </section></div></main>
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Espace organisateur</p>
          <h1>{event.title}</h1>
          <p>{event.mode === 'invitation' ? 'Voici les réponses reçues pour ton invitation.' : 'Ton annonce est prête à être partagée.'}</p>

          <div className="cl-event-info">
            <span>{type?.emoji || '✨'} {type?.label || 'Événement'}</span>
            {event.date && <span>📅 {event.date}</span>}
            {event.time && <span>🕐 {event.time}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>

          <div className="cl-share-box">
            <strong>🔗 Ton lien public</strong>
            <p>Partage ce lien avec tes invités ou avec les personnes que tu souhaites informer.</p>
            <div className="cl-link-box">{publicUrl}</div>
            <div className="cl-share-actions">
              <button className="cl-primary-button" type="button" onClick={handleShare}>📤 Partager</button>
              <button className="cl-secondary-button" type="button" onClick={handleCopy}>📋 Copier le lien</button>
            </div>
            {shareMessage && <p className="cl-share-feedback" role="status">{shareMessage}</p>}
          </div>

          {managementUrl && (
            <div className="cl-share-box cl-management-share-box">
              <strong>🔐 Ton lien privé de gestion</strong>
              <p>Garde ce lien précieusement : il permet de retrouver ton événement sans compte.</p>
              <div className="cl-link-box">{managementUrl}</div>
              <div className="cl-share-actions">
                <button className="cl-primary-button" type="button" onClick={async () => {
                  try { await copyText(managementUrl); setShareMessage('Lien privé de gestion copié.') }
                  catch { setShareMessage('Impossible de copier le lien privé.') }
                }}>📋 Copier le lien privé</button>
              </div>
            </div>
          )}

          {event.mode === 'invitation' && (
            <>
              <div className="cl-rsvp-summary">
                <div><strong>{summary.total}</strong><span>Total</span></div>
                <div><strong>{summary.yes}</strong><span>✅ Oui</span></div>
                <div><strong>{summary.maybe}</strong><span>🤔 Peut-être</span></div>
                <div><strong>{summary.no}</strong><span>❌ Non</span></div>
              </div>

              <div className="cl-rsvp-list">
                <div className="cl-list-heading">
                  <div><h2>Réponses des invités</h2><span>{filteredRsvps.length} résultat{filteredRsvps.length > 1 ? 's' : ''}</span></div>
                  <button className="cl-small-button" type="button" onClick={refreshRsvps} disabled={refreshing}>{refreshing ? 'Actualisation…' : '↻ Actualiser'}</button>
                </div>
                {rsvps.length > 0 && <div className="cl-rsvp-tools">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un invité…" aria-label="Rechercher un invité" />
                  <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer les réponses">
                    <option value="all">Toutes les réponses</option><option value="yes">✅ Oui</option><option value="maybe">🤔 Peut-être</option><option value="no">❌ Non</option>
                  </select>
                </div>}
                {rsvps.length === 0 ? (
                  <p className="cl-empty">Aucune réponse pour le moment. Partage ton invitation pour commencer à recevoir des réponses.</p>
                ) : filteredRsvps.length === 0 ? (
                  <p className="cl-empty">Aucun invité ne correspond à ta recherche.</p>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <article className="cl-rsvp-item" key={rsvp.id}>
                      <div>
                        <strong>{rsvp.name}</strong>
                        {rsvp.message && <p>{rsvp.message}</p>}
                      </div>
                      <span className={`cl-rsvp-status is-${rsvp.status}`}>{LABELS[rsvp.status]}</span>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir l’événement public →</button>
          <button className="cl-secondary-button" type="button" onClick={() => navigate('/organiser')}>＋ Créer un autre événement</button>
        </section>
      </div>
    </main>
  )
}
