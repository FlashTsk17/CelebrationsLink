import { useNavigate } from 'react-router-dom'

export default function AccessGateNotice({ level = 'member', action = 'cette fonctionnalité', returnTo = '/celebrer/personnaliser' }) {
  const navigate = useNavigate()
  const isPremium = level === 'premium'
  const title = isPremium ? 'Cette expérience est Premium' : 'Une petite étape avant de continuer'
  const description = isPremium
    ? 'Passe à Premium pour débloquer cette fonctionnalité et enrichir tes célébrations.'
    : 'Crée gratuitement ton compte Membre pour conserver cette action et retrouver ta célébration plus tard.'

  const go = () => {
    const params = new URLSearchParams({ reason: action, returnTo })
    navigate(isPremium ? `/membre/premium?${params.toString()}` : `/membre?auth=signup&${params.toString()}`)
  }

  return (
    <div className={`cl-access-notice ${isPremium ? 'cl-access-notice--premium' : ''}`} role="dialog" aria-label={title}>
      <div className="cl-access-notice-icon" aria-hidden="true">{isPremium ? '🟣' : '🔐'}</div>
      <div className="cl-access-notice-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button className="cl-primary-button" type="button" onClick={go}>
        {isPremium ? 'Découvrir Premium' : 'Créer mon compte gratuitement'}
      </button>
    </div>
  )
}
