import { useState } from 'react'
import { isSupabaseConfigured, signInMember, signUpMember } from '../services/auth.js'

export default function AuthModal({ mode = 'signup', onClose, onSuccess }) {
  const [view, setView] = useState(mode === 'signin' ? 'signin' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      if (!isSupabaseConfigured) throw new Error('L’espace Membre est temporairement indisponible. Le service de compte n’est pas connecté à cette version.')
      const data = view === 'signup' ? await signUpMember({ name, email, password }) : await signInMember({ email, password })
      if (view === 'signup' && !data.session) {
        setMessage('Compte créé. Vérifie ton e-mail pour confirmer ton adresse, puis connecte-toi.')
        setView('signin')
      } else onSuccess?.(data.user)
    } catch (authError) { setError(authError?.message || 'Impossible de continuer. Vérifie tes informations.') }
    finally { setLoading(false) }
  }

  return (
    <div className="cl-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className="cl-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="cl-modal__close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <p className="cl-eyebrow">{view === 'signup' ? '✦ Commencer' : '✦ Bon retour'}</p>
        <h2 id="auth-title">{view === 'signup' ? 'Créer ton espace' : 'Entrer dans ton espace'}</h2>
        <p>{view === 'signup' ? 'Tes créations te suivent, sans perdre la simplicité de CélébrationsLink.' : 'Retrouve tes créations et continue ton parcours.'}</p>
        <form className="cl-form" onSubmit={submit}>
          {view === 'signup' && <label>Prénom ou nom<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Juliette" autoComplete="name" required /></label>}
          <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" autoComplete="email" required /></label>
          <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" autoComplete={view === 'signup' ? 'new-password' : 'current-password'} minLength="8" required /></label>
          {error && <p className="cl-form-error" role="alert">{error}</p>}
          {message && <p className="cl-premium-success" role="status">{message}</p>}
          <button className="cl-primary-button" type="submit" disabled={loading}>{loading ? 'Un instant…' : view === 'signup' ? 'Créer mon compte ✦' : 'Se connecter →'}</button>
        </form>
        <div className="cl-auth-switch-row"><span>{view === 'signup' ? 'Déjà membre ?' : 'Nouveau ici ?'}</span><button type="button" onClick={() => { setError(''); setMessage(''); setView(view === 'signup' ? 'signin' : 'signup') }}>{view === 'signup' ? 'Se connecter' : 'Créer un compte'}</button></div>
      </section>
    </div>
  )
}
