import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange } from '../services/auth.js'

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/organiser', label: 'Organiser' },
  { to: '/celebrer', label: 'Célébrer' },
]

export default function AppNavigation() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let active = true
    getCurrentUser().then((current) => { if (active) setUser(current) })
    const unsubscribe = onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => { active = false; unsubscribe() }
  }, [])

  return <header className="cl-app-nav">
    <button className="cl-app-nav__brand" type="button" onClick={() => navigate('/')}>CélébrationsLink</button>
    <nav aria-label="Navigation principale">
      {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>)}
    </nav>
    <div className="cl-app-nav__account">
      {user ? <NavLink to="/membre/espace">🔵 Mon espace</NavLink> : <NavLink to="/membre">Se connecter</NavLink>}
      <NavLink className="cl-premium-link" to="/premium">🟣 Premium</NavLink>
    </div>
  </header>
}
