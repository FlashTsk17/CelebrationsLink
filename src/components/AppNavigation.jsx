import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange } from '../services/auth.js'

const links = [
  { to: '/organiser', label: 'Organiser' },
  { to: '/celebrer', label: 'Célébrer' },
  { to: '/premium', label: 'Premium', premium: true },
]

export default function AppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let active = true
    getCurrentUser().then((current) => { if (active) setUser(current) })
    const unsubscribe = onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => { active = false; unsubscribe() }
  }, [])

  const firstName = user?.user_metadata?.display_name?.split(' ')[0]

  return (
    <header className="cl-app-nav">
      <button className="cl-app-nav__brand" type="button" onClick={() => navigate('/')} aria-label="CélébrationsLink — accueil">
        <span aria-hidden="true">✦</span> CélébrationsLink
      </button>
      <nav aria-label="Navigation principale">
        <NavLink to="/" end>Accueil</NavLink>
        {links.map((link) => <NavLink key={link.to} to={link.to} className={link.premium ? 'cl-premium-link' : ''}>{link.premium ? '✦ Premium' : link.label}</NavLink>)}
      </nav>
      <div className="cl-app-nav__account">
        {user
          ? <NavLink to="/membre/espace" className="cl-member-nav">{firstName ? 'Bonjour ' + firstName : 'Mon espace'}</NavLink>
          : <button className="cl-nav-cta" type="button" onClick={() => navigate('/membre?returnTo=' + encodeURIComponent(location.pathname))}>Mon espace</button>}
      </div>
    </header>
  )
}
