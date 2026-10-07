import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isSupabaseConfigured, signInMember, signUpMember } from '../services/auth.js'
import { getReturnPath } from '../services/navigationPolicy.js'

export default function MemberAuth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = getReturnPath(params.get('returnTo'), '/membre/espace')
  const [mode, setMode] = useState(params.get('auth') === 'login' ? 'login' : 'signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      if (!isSupabaseConfigured) throw new Error('L’espace Membre est temporairement indisponible. Le service de compte n’est pas encore connecté à cette version du site.')
      if (mode === 'signup') {
        const data = await signUpMember(form)
        if (!data.session) {
          setMessage('Compte créé. Vérifie ton e-mail pour confirmer ton adresse, puis reviens te connecter.')
          setMode('login')
        } else navigate(returnTo, { replace: true })
      } else {
        await signInMember(form)
        navigate(returnTo, { replace: true })
      }
    } catch (submissionError) {
      setError(submissionError?.message || 'Impossible de continuer. Vérifie tes informations.')
    } finally { setLoading(false) }
  }

  return (
    <main className="cl-auth-page">
      <section className="cl-auth-card">
        <aside className="cl-auth-aside">
          <span className="cl-signature-kicker">✦ Espace personnel</span>
          <h1>Garde tes créations. Retrouve tes moments.</h1>
          <p>Ton compte transforme CélébrationsLink en un espace où tes expériences restent accessibles, évolutives et prêtes à être partagées.</p>
          <div className="cl-auth-perks">
            <span>✓ Retrouve tes créations sur plusieurs appareils</span>
            <span>✓ Continue une création sans repartir de zéro</span>
            <span>✓ Accède aux expériences Membre et Premium</span>
          </div>
        </aside>
        <div className="cl-auth-form">
          <p className="cl-eyebrow">{mode === 'signup' ? 'Bienvenue' : 'Bon retour'}</p>
          <h2>{mode === 'signup' ? 'Créer ton espace' : 'Se connecter'}</h2>
          <div className="cl-auth-tabs">
            <button className={mode === 'signup' ? 'is-active' : ''} type="button" onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Créer un compte</button>
            <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}>Se connecter</button>
          </div>
          <form className="cl-form" onSubmit={submit}>
            {mode === 'signup' && <label>Prénom ou nom<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Juliette" autoComplete="name" required /></label>}
            <label>Adresse e-mail<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.com" autoComplete="email" required /></label>
            <label>Mot de passe<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 caractères minimum" minLength="8" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
            {error && <p className="cl-form-error" role="alert">{error}</p>}
            {message && <p className="cl-premium-success" role="status">{message}</p>}
            <button className="cl-primary-button" type="submit" disabled={loading}>{loading ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte ✦' : 'Entrer dans mon espace →'}</button>
          </form>
          <div className="cl-auth-switch-row"><span>{mode === 'signup' ? 'Tu as déjà un compte ?' : 'Pas encore de compte ?'}</span><button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Se connecter' : 'Créer mon compte'}</button></div>
          <button className="cl-auth-link" type="button" onClick={() => navigate(-1)}>← Retour</button>
        </div>
      </section>
    </main>
  )
}
