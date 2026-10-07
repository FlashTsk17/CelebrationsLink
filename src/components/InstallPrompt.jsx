import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault()
      setDeferred(event)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const installed = () => setVisible(false)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  if (!visible || !deferred) return null

  const install = async () => {
    await deferred.prompt()
    const result = await deferred.userChoice
    if (result?.outcome) setVisible(false)
    setDeferred(null)
  }

  return (
    <aside className="cl-install-bubble" role="status" aria-live="polite">
      <strong>✨ Garde CélébrationsLink avec toi</strong>
      <p>Installe l’expérience sur ton téléphone pour la retrouver comme une vraie application.</p>
      <div className="cl-install-actions">
        <button className="primary" type="button" onClick={install}>Installer</button>
        <button className="ghost" type="button" onClick={() => { setVisible(false); setDeferred(null) }}>Plus tard</button>
      </div>
    </aside>
  )
}
