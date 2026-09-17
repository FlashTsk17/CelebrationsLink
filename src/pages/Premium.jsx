import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth.js'
import { getMembership, listMyPremiumRequests, requestPremium, PREMIUM_BENEFITS } from '../services/premium.js'

const STATUS_LABELS = { pending: 'Demande reçue', contacted: 'Prise de contact', payment_pending: 'Paiement en attente', approved: 'Approuvée', rejected: 'Refusée', cancelled: 'Annulée' }

export default function Premium() {
  const navigate = useNavigate()
  const [user, setUser] = useState(undefined)
  const [membership, setMembership] = useState(null)
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) return
      try {
        const [profile, history] = await Promise.all([getMembership(), listMyPremiumRequests()])
        setMembership(profile); setRequests(history)
      } catch (loadError) { setError(loadError?.message || 'Impossible de charger ton espace Premium.') }
    })
  }, [])

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSaving(true)
    try {
      const result = await requestPremium(message)
      setRequests((current) => [result, ...current]); setMessage('')
    } catch (submitError) { setError(submitError?.message || 'Impossible d’envoyer la demande.') }
    finally { setSaving(false) }
  }

  if (user === undefined) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Chargement de Premium…</p></section></div></main>
  if (!user) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-premium-page"><p className="cl-eyebrow">Premium 🟣</p><h1>Une expérience plus riche.</h1><p>Premium est réservé aux membres. Crée ton compte gratuitement pour découvrir l’offre.</p><button className="cl-primary-button" type="button" onClick={() => navigate('/membre')}>Devenir Membre gratuitement →</button></section></div></main>

  const active = membership?.access_level === 'premium' && membership?.premium_status === 'active'
  const pending = requests.some((item) => ['pending', 'contacted', 'payment_pending'].includes(item.status))

  return <main className="cl-shell cl-premium-shell"><div className="cl-container">
    <section className="cl-premium-hero"><span className="cl-premium-badge">🟣 CÉLÉBRATIONSLINK PREMIUM</span><h1>Passe à une expérience qui se remarque.</h1><p>Des créations plus riches, plus personnalisées et plus mémorables, sans compliquer ton expérience.</p>{active && <div className="cl-premium-active">✓ Premium actif</div>}</section>
    <section className="cl-premium-card"><div className="cl-premium-card__intro"><span className="cl-premium-orb">✦</span><div><h2>Ce que Premium débloque</h2><p>Une évolution naturelle de ton espace Membre.</p></div></div><div className="cl-premium-benefits">{PREMIUM_BENEFITS.map((benefit) => <div key={benefit}><span>✓</span><strong>{benefit}</strong></div>)}</div>{active ? <div className="cl-premium-success"><strong>Premium est actif 🎉</strong><span>Ton compte bénéficie actuellement des fonctionnalités Premium.</span></div> : pending ? <div className="cl-premium-pending"><strong>Ta demande est en cours de traitement.</strong><span>Nous te recontacterons pour finaliser l’activation.</span></div> : <form className="cl-form" onSubmit={submit}><label>Un message pour l’équipe <span>(facultatif)</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="4" placeholder="Ex. Je souhaite utiliser Premium pour mon mariage…" /></label>{error && <p className="cl-form-error" role="alert">{error}</p>}<button className="cl-primary-button" type="submit" disabled={saving}>{saving ? 'Envoi de la demande…' : 'Demander l’activation Premium →'}</button></form>}</section>
    {requests.length > 0 && <section className="cl-panel cl-premium-history"><p className="cl-eyebrow">Historique</p><h2>Mes demandes Premium</h2>{requests.map((item) => <article key={item.id}><strong>{STATUS_LABELS[item.status] || item.status}</strong><span>{new Date(item.requested_at).toLocaleDateString('fr-FR')}</span></article>)}</section>}
    <button className="cl-secondary-button" type="button" onClick={() => navigate('/membre/espace')}>← Retour à mon espace</button>
  </div></main>
}
