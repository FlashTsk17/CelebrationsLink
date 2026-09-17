import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.js'
import { activatePremium, listPremiumRequests, rejectPremium, updatePremiumRequestStatus } from '../services/adminPremium.js'

const STATUS_LABELS = { pending: 'Nouvelle', contacted: 'Contactée', payment_pending: 'Paiement à confirmer', approved: 'Approuvée', rejected: 'Refusée', cancelled: 'Annulée' }

export default function AdminPremium() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')

  const load = async () => {
    setError(''); setLoading(true)
    try { setRequests(await listPremiumRequests()) }
    catch (loadError) { setError(loadError?.message || 'Accès administrateur refusé.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((item) => item.status === 'pending').length,
    payment: requests.filter((item) => item.status === 'payment_pending').length,
    active: requests.filter((item) => item.access_level === 'premium' && item.premium_status === 'active').length,
  }), [requests])

  const update = async (request, action) => {
    setWorking(request.id); setError(''); setNotice('')
    try {
      if (action === 'approve') {
        const days = window.prompt('Durée Premium en jours. Laisser vide pour sans expiration :', '30')
        if (days === null) return
        let expiresAt = null
        if (days.trim()) {
          const parsed = Number(days)
          if (!Number.isFinite(parsed) || parsed <= 0) throw new Error('Durée Premium invalide.')
          expiresAt = new Date(Date.now() + parsed * 86400000).toISOString()
        }
        const note = window.prompt('Note interne (facultatif) :', '') || ''
        await activatePremium(request.id, expiresAt, note)
      }
      if (action === 'reject') {
        if (!window.confirm('Refuser cette demande Premium ?')) return
        const note = window.prompt('Motif interne (facultatif) :', '') || ''
        await rejectPremium(request.id, note)
      }
      if (action === 'contacted') await updatePremiumRequestStatus(request.id, 'contacted')
      if (action === 'payment_pending') await updatePremiumRequestStatus(request.id, 'payment_pending')
      setNotice('Action enregistrée.')
      await load()
    } catch (actionError) { setError(actionError?.message || 'Action impossible.') }
    finally { setWorking('') }
  }

  if (!supabase) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Administration Premium</h1><p>Supabase doit être configuré.</p></section></div></main>

  return <main className="cl-shell"><div className="cl-container">
    <section className="cl-hero"><div className="cl-brand">Administration Premium 🔐</div><p className="cl-tagline">Les droits administrateur sont vérifiés côté serveur. Cet espace ne donne aucun privilège supplémentaire au navigateur.</p></section>
    {error && <section className="cl-panel"><p className="cl-form-error" role="alert">{error}</p></section>}
    {notice && <section className="cl-panel cl-premium-success"><strong>{notice}</strong></section>}
    <section className="cl-grid"><div className="cl-panel"><span>Demandes</span><h2>{stats.total}</h2></div><div className="cl-panel"><span>À traiter</span><h2>{stats.pending}</h2></div><div className="cl-panel"><span>Paiement</span><h2>{stats.payment}</h2></div><div className="cl-panel"><span>Premium actifs</span><h2>{stats.active}</h2></div></section>
    <section className="cl-panel cl-admin-page"><div className="cl-premium-card__intro"><div><p className="cl-eyebrow">File Premium</p><h2>Demandes des membres</h2></div><button className="cl-secondary-button" type="button" onClick={load}>Actualiser</button></div>
      {loading ? <p>Chargement…</p> : requests.length === 0 ? <p className="cl-empty">Aucune demande.</p> : <div className="cl-admin-list">{requests.map((request) => <article key={request.id} className="cl-admin-item">
        <div><div className="cl-admin-item__top"><strong>{request.display_name || 'Membre sans nom'}</strong><span>{STATUS_LABELS[request.status] || request.status}</span></div><p>{request.email || request.user_id}</p><p>{request.customer_message || 'Aucun message.'}</p><small>Demandé le {new Date(request.requested_at).toLocaleString('fr-FR')}</small>{request.premium_expires_at && <small> · Expiration {new Date(request.premium_expires_at).toLocaleDateString('fr-FR')}</small>}</div>
        {!['approved','rejected','cancelled'].includes(request.status) && <div className="cl-admin-actions"><button className="cl-secondary-button" disabled={working===request.id} onClick={() => update(request, 'contacted')}>Contactée</button><button className="cl-secondary-button" disabled={working===request.id} onClick={() => update(request, 'payment_pending')}>Paiement</button><button className="cl-primary-button" disabled={working===request.id} onClick={() => update(request, 'approve')}>{working===request.id ? 'Traitement…' : 'Activer'}</button><button className="cl-secondary-button" disabled={working===request.id} onClick={() => update(request, 'reject')}>Refuser</button></div>}
      </article>)}</div>}
    </section>
    <button className="cl-secondary-button" type="button" onClick={() => navigate('/membre/espace')}>← Quitter l’administration</button>
  </div></main>
}
