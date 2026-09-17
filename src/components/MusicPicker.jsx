import { useEffect, useMemo, useRef, useState } from 'react'
import { MUSIC_CATEGORIES, getRecommendedMusic } from '../data/musicLibrary.js'

const ACCEPTED_AUDIO = 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/x-m4a,.mp3,.m4a,.wav,.ogg'
const MAX_SIZE = 15 * 1024 * 1024

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function MusicPicker({ occasion, value, onChange }) {
  const audioRef = useRef(null)
  const [mode, setMode] = useState(value?.source === 'custom' ? 'custom' : 'library')
  const [category, setCategory] = useState('recommended')
  const [playing, setPlaying] = useState(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState('')
  const recommendations = useMemo(() => getRecommendedMusic(occasion), [occasion])
  const tracks = category === 'recommended' ? recommendations : []

  useEffect(() => {
    if (mode === 'library' && value?.source === 'custom') onChange(null)
  }, [mode])

  useEffect(() => () => { audioRef.current?.pause(); if (audioRef.current) audioRef.current.src = '' }, [])

  const play = (track) => {
    setError('')
    if (!track?.src) {
      setError('Cette piste sera disponible dès que son fichier audio sera ajouté à la bibliothèque.')
      return
    }
    if (playing === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }
    audioRef.current?.pause()
    audioRef.current = new Audio(track.src)
    audioRef.current.onloadedmetadata = () => setDuration(audioRef.current.duration || 0)
    audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current.currentTime || 0)
    audioRef.current.onended = () => { setPlaying(null); setCurrentTime(0) }
    audioRef.current.play().catch(() => setError('Impossible de lire cette piste.'))
    setPlaying(track.id)
  }

  const chooseLibrary = (track) => {
    if (!track?.src) return setError('Cette piste n’est pas encore publiée dans la bibliothèque.')
    onChange({ source: 'library', id: track.id, title: track.title, category: track.category, src: track.src })
  }

  const handleFile = (event) => {
    setError('')
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|wav|ogg)$/i.test(file.name)) return setError('Choisis un fichier audio MP3, M4A, WAV ou OGG.')
    if (file.size > MAX_SIZE) return setError('La musique doit faire 15 Mo maximum.')
    const url = URL.createObjectURL(file)
    onChange({ source: 'custom', title: file.name.replace(/\.[^.]+$/, ''), fileName: file.name, mimeType: file.type || 'audio/mpeg', size: file.size, src: url })
    setMode('custom')
  }

  const custom = value?.source === 'custom' ? value : null

  return (
    <section className="cl-music-picker">
      <div className="cl-music-picker__heading">
        <div><p className="cl-eyebrow">🎵 Musique</p><h3>Donne une ambiance à ta célébration</h3></div>
        <span>Optionnel</span>
      </div>
      <div className="cl-music-tabs">
        <button type="button" className={mode === 'library' ? 'is-selected' : ''} onClick={() => setMode('library')}>🎶 Bibliothèque</button>
        <button type="button" className={mode === 'custom' ? 'is-selected' : ''} onClick={() => setMode('custom')}>📁 Ma musique</button>
        {value && <button type="button" onClick={() => { onChange(null); setPlaying(null) }}>✕ Sans musique</button>}
      </div>

      {mode === 'library' ? <>
        <div className="cl-music-categories"><button type="button" className={category === 'recommended' ? 'is-selected' : ''} onClick={() => setCategory('recommended')}>✨ Pour cette occasion</button>{MUSIC_CATEGORIES.slice(0, 6).map((item) => <button key={item.id} type="button" className={category === item.id ? 'is-selected' : ''} onClick={() => setCategory(item.id)}>{item.emoji} {item.label}</button>)}</div>
        <div className="cl-music-list">
          {tracks.map((track) => <article className={`cl-music-track ${value?.id === track.id ? 'is-selected' : ''}`} key={track.id}>
            <button type="button" className="cl-music-play" onClick={() => play(track)} aria-label={playing === track.id ? `Pause ${track.title}` : `Écouter ${track.title}`}>{playing === track.id ? '❚❚' : '▶'}</button>
            <div className="cl-music-track__body"><strong>{track.title}</strong><span>{track.artist} · {track.category}</span></div>
            <button type="button" className="cl-music-use" onClick={() => chooseLibrary(track)}>Choisir</button>
          </article>)}
          {tracks.length === 0 && <p className="cl-empty">Aucune recommandation pour cette occasion pour le moment.</p>}
        </div>
      </> : <div className="cl-custom-music">
        <label className="cl-upload-audio"><span>📁</span><strong>{custom ? 'Changer ma musique' : 'Choisir un fichier audio'}</strong><small>MP3, M4A, WAV ou OGG · 15 Mo max</small><input type="file" accept={ACCEPTED_AUDIO} onChange={handleFile} /></label>
        {custom && <div className="cl-custom-music__selected"><div><strong>{custom.title}</strong><span>{custom.fileName}</span></div><audio controls src={custom.src} /></div>}
        <p className="cl-music-note">Ta musique personnelle est utilisée pour cette création. Pour la rendre disponible sur le lien public, elle devra ensuite être envoyée vers le stockage sécurisé de CélébrationsLink.</p>
      </div>}
      {error && <p className="cl-form-error" role="alert">{error}</p>}
      {playing && <div className="cl-music-now">▶ Lecture · {playing} · {formatTime(currentTime)} / {formatTime(duration)}</div>}
    </section>
  )
}
