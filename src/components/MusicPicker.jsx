import { useEffect, useMemo, useRef, useState } from 'react'
import { MUSIC_CATEGORIES, getRecommendedMusic } from '../data/musicLibrary.js'
import { createLocalMusicTrack, getAllLibraryMusic, uploadMusicFile, validateAudioFile } from '../services/musicEngine.js'

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00'
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`
}

export default function MusicPicker({ occasion, value, onChange }) {
  const audioRef = useRef(null)
  const [mode, setMode] = useState(value?.source === 'custom' ? 'custom' : 'library')
  const [category, setCategory] = useState('recommended')
  const [playing, setPlaying] = useState(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const recommendations = useMemo(() => getRecommendedMusic(occasion), [occasion])
  const tracks = useMemo(() => category === 'recommended' ? recommendations : getAllLibraryMusic().filter((track) => track.category === category), [category, recommendations])

  useEffect(() => {
    if (mode === 'library' && value?.source === 'custom') onChange(null)
  }, [mode, value?.source, onChange])

  useEffect(() => () => {
    audioRef.current?.pause()
    audioRef.current = null
  }, [])

  useEffect(() => {
    if (category !== 'recommended' && !tracks.some((track) => track.id === value?.id) && value?.source === 'library') onChange(null)
  }, [category, tracks, value?.id, value?.source, onChange])

  const stop = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlaying(null)
    setCurrentTime(0)
    setDuration(0)
  }

  const play = (track) => {
    setError('')
    if (!track?.src) return setError('Cette piste est référencée dans la bibliothèque mais son fichier audio n’est pas encore publié.')
    if (playing === track.id) return stop()
    stop()
    const audio = new Audio(track.src)
    audio.volume = volume
    audioRef.current = audio
    audio.onloadedmetadata = () => setDuration(audio.duration || 0)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime || 0)
    audio.onended = stop
    audio.play().then(() => setPlaying(track.id)).catch(() => setError('Impossible de lire cette piste.'))
  }

  const seek = (event) => {
    const nextTime = Number(event.target.value)
    if (audioRef.current && Number.isFinite(nextTime)) {
      audioRef.current.currentTime = nextTime
      setCurrentTime(nextTime)
    }
  }

  const changeVolume = (event) => {
    const nextVolume = Number(event.target.value)
    setVolume(nextVolume)
    if (audioRef.current) audioRef.current.volume = nextVolume
  }

  const chooseLibrary = (track) => {
    if (!track?.src) return setError('Cette piste n’est pas encore disponible à l’écoute.')
    stop()
    onChange({ source: 'library', id: track.id, title: track.title, artist: track.artist, category: track.category, src: track.src })
  }

  const autoSelect = () => {
    const recommended = recommendations.find((track) => track.src) || recommendations[0]
    if (!recommended) return setError('Aucune musique recommandée pour cette occasion.')
    if (!recommended.src) return setError('La recommandation existe, mais son fichier audio n’est pas encore publié.')
    chooseLibrary(recommended)
  }

  const handleFile = async (event) => {
    setError('')
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const validation = validateAudioFile(file)
      if (!validation.valid) throw new Error(validation.error)
      stop()
      setUploading(true)
      const track = await uploadMusicFile(file)
      if (value?.source === 'custom' && value.src) URL.revokeObjectURL(value.src)
      onChange({ source: 'custom', id: track.id, title: track.title, artist: track.artist, category: track.category, fileName: track.fileName, mimeType: track.mimeType || file.type, size: track.size, src: track.src || '', storage: track.storage, storagePath: track.storagePath, isLocal: track.isLocal || false })
      setMode('custom')
    } catch (err) {
      setError(err.message || 'Impossible d’enregistrer cette musique.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
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
        {value && <button type="button" onClick={() => { stop(); onChange(null) }}>✕ Sans musique</button>}
      </div>

      {mode === 'library' ? <>
        <div className="cl-music-categories">
          <button type="button" className={category === 'recommended' ? 'is-selected' : ''} onClick={() => setCategory('recommended')}>✨ Pour cette occasion</button>
          {MUSIC_CATEGORIES.map((item) => <button key={item.id} type="button" className={category === item.id ? 'is-selected' : ''} onClick={() => setCategory(item.id)}>{item.emoji} {item.label}</button>)}
        </div>
        <button className="cl-secondary-button" type="button" onClick={autoSelect}>✨ Choisir automatiquement pour cette occasion</button>
        <div className="cl-music-list">
          {tracks.map((track) => <article className={`cl-music-track ${value?.id === track.id ? 'is-selected' : ''}`} key={track.id}>
            <button type="button" className="cl-music-play" onClick={() => play(track)} aria-label={playing === track.id ? `Pause ${track.title}` : `Écouter ${track.title}`}>{playing === track.id ? '❚❚' : '▶'}</button>
            <div className="cl-music-track__body"><strong>{track.title}</strong><span>{track.artist} · {track.category}</span></div>
            <button type="button" className="cl-music-use" onClick={() => chooseLibrary(track)}>Choisir</button>
          </article>)}
          {tracks.length === 0 && <p className="cl-empty">Aucune musique dans cette catégorie pour le moment.</p>}
        </div>
        {playing && <div className="cl-music-controls"><input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={seek} aria-label="Position de lecture" /><div><span>{formatTime(currentTime)} / {formatTime(duration)}</span><label>🔊 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={changeVolume} aria-label="Volume" /></label></div></div>}
      </> : <div className="cl-custom-music">
        <label className="cl-upload-audio"><span>📁</span><strong>{uploading ? 'Enregistrement en cours…' : custom ? 'Changer ma musique' : 'Choisir un fichier audio'}</strong><small>MP3, M4A, WAV, OGG, WEBM ou AAC · 15 Mo max</small><input type="file" disabled={uploading} accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/aac,.mp3,.m4a,.wav,.ogg,.webm,.aac" onChange={handleFile} /></label>
        {custom && custom.src && <div className="cl-custom-music__selected"><div><strong>{custom.title}</strong><span>{custom.fileName}</span></div><audio controls preload="metadata" src={custom.src} /></div>}
        {custom && custom.storage === 'supabase' && <p className="cl-music-cloud-status">☁️ Musique enregistrée dans le stockage sécurisé.</p>}
        <p className="cl-music-note">Avec un compte Membre et Supabase activé, ta musique est conservée dans le cloud pour pouvoir être utilisée sur une célébration publique.</p>
      </div>}
      {error && <p className="cl-form-error" role="alert">{error}</p>}
    </section>
  )
}
