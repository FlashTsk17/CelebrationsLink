import { useState } from 'react'
import { signInMember, signUpMember } from '../services/auth.js'

export default function AuthModal({ mode = 'signup', onClose, onSuccess }) {
  const [view, setView] = useState(mode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = view === 'signup'
        ? await signUpMember({ name, email, password })
        : await signInMember({ email, password })

      if (view === 'signup' && !data.session) {
        setError('Compte créé. Vérifie ton e-mail pour confirmer ton adresse avant de te connecter.')
        setLoading(false)
        return
      }

      onSuccess?.(data.user)
    } catch (authError) {
      setError(authError?.message || 'Impossible de continuer. Vérifie tes informations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cl-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className="cl-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="cl-modal__close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <p className="cl-eyebrow">Espace Membre 🔵</p>
        <h2 id="auth-title">{view === 'signup' ? 'Créer mon compte' : 'Se connecter'}</h2>
        <p>{view === 'signup' ? 'Retrouve tes créations et ton espace personnel sur tous tes appareils.' : 'Retrouve ton espace personnel CélébrationsLink.'}</p>

        <form className="cl-form" onSubmit={submit}>
          {view === 'signup' && (
            <label>Nom ou prénom<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Tsadok" autoComplete="name" required /></label>
          )}
          <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" autoComplete="email" required /></label>
          <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" autoComplete={view === 'signup' ? 'new-password' : 'current-password'} required minLength="8" /></label>
          {error && <p className="cl-form-error" role="alert">{error}</p>}
          <button className="cl-primary-button" type="submit" disabled={loading}>{loading ? 'Patiente…' : view === 'signup' ? 'Créer mon compte →' : 'Se connecter →'}</button>
        </form>

        <button className="cl-auth-switch" type="button" onClick={() => { setError(''); setView(view === 'signup' ? 'signin' : 'signup') }}>
          {view === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte gratuitement'}
        </button>
      </section>
    </div>
  )
}
