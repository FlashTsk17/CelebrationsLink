import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.js'

const LABELS = { pending:'Nouvelle', contacted:'Contactée', payment_pending:'Paiement à confirmer', approved:'Approuvée', rejected:'Refusée', cancelled:'Annulée' }

export default function AdminPremium() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')

  const callAdmin = async (body) => {
    const { data, error: invokeError } = await supabase.functions.invoke('admin-premium', { body })
    if (invokeError) throw invokeError
    if (data?.error) throw new Error(data.error)
    return data
  }

  const load = async () => {
    setError(''); setLoading(true)
    try { const data = await callAdmin({ action:'list' }); setRequests(data.requests || []) }
    catch (loadError) { setError(loadError?.message || 'Accès administrateur refusé.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const activate = async (request) => {
    const days = window.prompt('Durée Premium en jours (ex. 30). Laisser vide pour sans expiration :', '30')
    if (days === null) return
    const note = window.prompt('Note interne (facultatif) :', '') || ''
    let expiresAt = null
    if (days.trim()) {
      const parsed = Number(days)
      if (!Number.isFinite(parsed) || parsed <= 0) { setError('Durée invalide.'); return }
      expiresAt = new Date(Date.now() + parsed * 86400000).toISOString()
    }
    setWorking(request.id); setError('')
    try { await callAdmin({ action:'activate', requestId:request.id, expiresAt, note }); await load() }
    catch (actionError) { setError(actionError?.message || 'Activation impossible.') }
    finally { setWorking('') }
  }

  const reject = async (request) => {
    if (!window.confirm('Refuser cette demande Premium ?')) return
    const note = window.prompt('Motif interne (facultatif) :', '') || ''
    setWorking(request.id); setError('')
    try { await callAdmin({ action:'reject', requestId:request.id, note }); await load() }
    catch (actionError) { setError(actionError?.message || 'Action impossible.') }
    finally { setWorking('') }
  }

  if (!supabase) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Administration Premium</h1><p>Supabase doit être configuré.</p></section></div></main>
  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-admin-page"><p className="cl-eyebrow">Administration 🔐</p><h1>Demandes Premium</h1><p>Activation réservée aux identités administrateur configurées côté serveur.</p>{error && <p className="cl-form-error" role="alert">{error}</p>}{loading ? <p>Chargement…</p> : requests.length === 0 ? <p className="cl-empty">Aucune demande.</p> : <div className="cl-admin-list">{requests.map((request) => <article key={request.id} className="cl-admin-item"><div><strong>{LABELS[request.status] || request.status}</strong><p>ID membre : {request.user_id}</p><p>{request.customer_message || 'Aucun message.'}</p><small>{new Date(request.requested_at).toLocaleString('fr-FR')}</small></div>{['pending','contacted','payment_pending'].includes(request.status) && <div className="cl-admin-actions"><button className="cl-primary-button" disabled={working===request.id} onClick={() => activate(request)}>Activer</button><button className="cl-secondary-button" disabled={working===request.id} onClick={() => reject(request)}>Refuser</button></div>}</article>)}</div>}<button className="cl-secondary-button" onClick={() => navigate('/membre/espace')}>← Quitter l’administration</button></section></div></main>
}
