import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signInMember, signUpMember } from '../services/auth.js'

export default function MemberAuth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/membre/espace'
  const reason = params.get('reason')
  const [mode, setMode] = useState(params.get('auth') === 'login' ? 'login' : 'signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const afterAuth = () => navigate(returnTo.startsWith('/') ? returnTo : '/membre/espace', { replace: true })

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const data = await signUpMember(form)
        if (!data.session) setMessage('Compte créé. Vérifie ton e-mail si une confirmation est demandée, puis connecte-toi.')
        else afterAuth()
      } else { await signInMember(form); afterAuth() }
    } catch (submissionError) { setError(submissionError?.message || 'Impossible de continuer.') }
    finally { setLoading(false) }
  }

  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel">
    <p className="cl-eyebrow">Espace Membre 🔵</p>
    <h1>{mode === 'signup' ? 'Créer mon compte gratuitement' : 'Me connecter'}</h1>
    <p>{reason ? 'Crée ton compte pour continuer cette action et retrouver ensuite ton parcours.' : mode === 'signup' ? 'Garde tes créations, retrouve-les plus tard et utilise CélébrationsLink sur plusieurs appareils.' : 'Retrouve ton espace personnel et tes créations.'}</p>
    <form className="cl-form" onSubmit={submit}>
      {mode === 'signup' && <label>Nom<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ton nom" required /></label>}
      <label>E-mail<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ton@email.com" autoComplete="email" required /></label>
      <label>Mot de passe<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 caractères minimum" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
      {error && <p className="cl-form-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
      <button className="cl-primary-button" type="submit" disabled={loading}>{loading ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte →' : 'Se connecter →'}</button>
    </form>
    <button className="cl-secondary-button" type="button" onClick={() => { setError(''); setMessage(''); setMode(mode === 'signup' ? 'login' : 'signup') }}>{mode === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte gratuitement'}</button>
    <button className="cl-auth-link" type="button" onClick={() => navigate(-1)}>← Retour</button>
  </section></div></main>
}
