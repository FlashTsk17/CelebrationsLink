import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCelebrationBySlugAsync } from '../services/celebrationService.js'
import { getCelebrationTemplate } from '../data/celebrationTemplates.js'

function FloatingHearts() {
  return <div className="cl-celebration__particles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ '--i': index }}>♥</span>)}</div>
}

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00'
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`
}

function MusicPlayer({ music, autoPlay = false }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.72)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    audio.volume = volume
    const loaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const time = () => setProgress(audio.currentTime || 0)
    const ended = () => setPlaying(false)
    audio.addEventListener('loadedmetadata', loaded)
    audio.addEventListener('timeupdate', time)
    audio.addEventListener('ended', ended)
    if (autoPlay) audio.play().then(() => setPlaying(true)).catch(() => {})
    return () => {
      audio.removeEventListener('loadedmetadata', loaded)
      audio.removeEventListener('timeupdate', time)
      audio.removeEventListener('ended', ended)
      audio.pause()
    }
  }, [autoPlay, music?.src])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted ? 0 : volume }, [muted, volume])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try { await audio.play(); setPlaying(true) } catch {}
    } else { audio.pause(); setPlaying(false) }
  }

  const seek = (event) => {
    const next = Number(event.target.value)
    if (audioRef.current) audioRef.current.currentTime = next
    setProgress(next)
  }

  if (!music?.src) return null
  return <section className="cl-celebration__music" aria-label="Lecteur musical">
    <audio ref={audioRef} src={music.src} preload="metadata" />
    <div className="cl-celebration__music-top"><div><span className="cl-celebration__music-icon">🎵</span><div><strong>{music.title || 'Musique de la célébration'}</strong><small>{music.artist || 'CélébrationsLink'}</small></div></div><button type="button" onClick={toggle} aria-label={playing ? 'Mettre en pause' : 'Lire la musique'}>{playing ? '❚❚' : '▶'}</button></div>
    <input className="cl-celebration__music-progress" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(progress, duration || 0)} onChange={seek} aria-label="Progression de la musique" />
    <div className="cl-celebration__music-controls"><span>{formatTime(progress)} / {formatTime(duration)}</span><label>🔊 <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={(event) => { setMuted(false); setVolume(Number(event.target.value)) }} aria-label="Volume" /></label><button type="button" onClick={() => setMuted((value) => !value)}>{muted ? 'Activer le son' : 'Muet'}</button></div>
  </section>
}

export default function Celebration() {
  const { slug } = useParams()
  const [celebration, setCelebration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getCelebrationBySlugAsync(slug).then((data) => {
      if (!active) return
      setCelebration(data)
      if (data) window.setTimeout(() => setRevealed(true), 120)
    }).catch(() => { if (active) setError('Impossible de charger cette célébration.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  if (loading) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p className="cl-eyebrow">Célébration</p><h1>Chargement…</h1><p>Préparation de ton expérience.</p></section></div></main>
  if (error || !celebration) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p className="cl-eyebrow">Célébration</p><h1>{error || 'Cette célébration est introuvable'}</h1><p>Le lien est peut-être incorrect ou cette célébration n'est plus disponible.</p></section></div></main>

  const template = getCelebrationTemplate(celebration.template)
  const animated = celebration.animations !== false
  const share = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: celebration.title, text: `Une célébration pour ${celebration.recipient} ❤️`, url }) } catch {} }
    else if (navigator.clipboard) await navigator.clipboard.writeText(url)
  }

  return <main className={`cl-shell cl-celebration cl-celebration--${template.accent} ${animated ? 'cl-celebration--animated' : ''} ${revealed ? 'is-revealed' : ''}`}>
    {animated && <FloatingHearts />}
    <div className="cl-container"><section className="cl-celebration__hero">
      <span className="cl-celebration__badge">{template.name}</span><div className="cl-celebration__icon" aria-hidden="true">{celebration.occasion === 'birthday' ? '🎂' : '✨'}</div>
      <p className="cl-eyebrow">Une célébration pour</p><h1>{celebration.recipient || 'Quelqu’un de spécial'} ❤️</h1>
      {celebration.title && <h2>{celebration.title}</h2>}<div className="cl-celebration__message">{celebration.message}</div>
      {celebration.sender && <p className="cl-celebration__sender">Avec affection, {celebration.sender}</p>}
      <MusicPlayer music={celebration.music} autoPlay={animated} />
      <button className="cl-primary-button cl-celebration__share" type="button" onClick={share}>Partager cette célébration ↗</button>
    </section>
    {celebration.photos?.length > 0 && <section className="cl-celebration__gallery" aria-label="Photos de la célébration">{celebration.photos.map((photo, index) => <figure key={`${photo}-${index}`}><img src={photo} alt={`Souvenir ${index + 1}`} loading="lazy" /><figcaption>Souvenir {index + 1}</figcaption></figure>)}</section>}
    <div className="cl-celebration__footer-note">Créé avec ❤️ sur CélébrationsLink</div><div className="cl-footer">CélébrationsLink · Crée. Célèbre. Partage. ❤️</div></div>
  </main>
}
