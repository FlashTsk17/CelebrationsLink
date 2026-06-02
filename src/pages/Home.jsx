import { useNavigate } from 'react-router-dom'

const VIOLET = '#6B21E8'
const CYAN = '#00C8FF'
const GOLD = '#C8A325'
const GOLD_L = '#F0C842'
const BG = '#07030F'
const MUTED = '#9B8EC4'

const LOGO = () => (
  <svg width="52" height="52" viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6B21E8"/>
        <stop offset="100%" stopColor="#00C8FF"/>
      </linearGradient>
      <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#00C8FF"/>
        <stop offset="100%" stopColor="#6B21E8"/>
      </linearGradient>
      <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F0C842"/>
        <stop offset="100%" stopColor="#C8A325"/>
      </linearGradient>
      <filter id="gv"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="40" cy="40" r="38" fill="#6B21E8" opacity="0.07"/>
    <path d="M 40 4.4 L 70.8 19.2 L 75.6 51.2 L 57.6 74.4 L 22.4 74.4 L 4.4 51.2 L 9.2 19.2 Z" stroke="url(#fg)" strokeWidth="2" strokeLinejoin="round" filter="url(#gv)"/>
    <path d="M 40 10 L 65.8 22.5 L 70 49.5 L 54.2 69.5 L 25.8 69.5 L 10 49.5 L 14.2 22.5 Z" stroke="url(#fg)" strokeWidth="0.7" strokeLinejoin="round" opacity="0.35"/>
    <circle cx="40" cy="4.4" r="1.5" fill="none" stroke="url(#fg)" strokeWidth="1"/>
    <circle cx="70.8" cy="19.2" r="1.5" fill="none" stroke="url(#fg)" strokeWidth="1"/>
    <circle cx="4.4" cy="51.2" r="1.5" fill="none" stroke="url(#fg)" strokeWidth="1"/>
    <circle cx="57.6" cy="74.4" r="1.5" fill="none" stroke="url(#fg)" strokeWidth="1"/>
    <rect x="21" y="31" width="38" height="9" rx="1.5" fill="url(#ig)" filter="url(#gv)"/>
    <rect x="34.5" y="40" width="11" height="18" rx="1.5" fill="url(#ig)" filter="url(#gv)"/>
    <polygon points="64,14 65.8,19.5 71.5,19.5 67,22.8 68.8,28.3 64,25 59.2,28.3 61,22.8 56.5,19.5 62.2,19.5" fill="url(#gg)"/>
    <line x1="29" y1="65" x2="51" y2="65" stroke="#00C8FF" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </svg>
)

const tools = [
  {
    path: '/birthday',
    emoji: '🎂',
    name: 'BirthdayLink',
    desc: 'Crée et partage une annonce d\'anniversaire magique et personnalisée.',
    color: '#FF6B6B',
    glow: 'rgba(255,107,107,0.15)',
    available: true,
  },
  {
    path: '/fete-meres',
    emoji: '💐',
    name: 'MothersLink',
    desc: 'Génère une belle affiche personnalisée pour la Fête des Mères.',
    color: '#D4698A',
    glow: 'rgba(212,105,138,0.15)',
    available: true,
  },
  {
    path: '/fete-peres',
    emoji: '👔',
    name: 'FathersLink',
    desc: 'Une affiche élégante pour souhaiter bonne fête à papa.',
    color: CYAN,
    glow: 'rgba(0,200,255,0.1)',
    available: false,
  },
  {
    path: '/noel',
    emoji: '🎄',
    name: 'NoelLink',
    desc: 'Envoie des vœux de Noël chaleureux à tes proches.',
    color: '#4CAF50',
    glow: 'rgba(76,175,80,0.1)',
    available: false,
  },
  {
    path: '/new-years',
    emoji: '🎆',
    name: 'NewYearsLink',
    desc: 'Des vœux étincelants pour célébrer le Nouvel An ensemble.',
    color: GOLD,
    glow: 'rgba(200,163,37,0.1)',
    available: false,
  },
]

export default function Home() {
  const nav = useNavigate()

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: 'white', padding: '0 0 60px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D0525, #1A0550, #07030F)', borderBottom: '1px solid rgba(200,163,37,0.15)', padding: '28px 20px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(107,33,232,0.3), transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 160, height: 160, background: 'radial-gradient(circle, rgba(0,200,255,0.12), transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <LOGO />
          <div style={{ textAlign: 'left', lineHeight: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, letterSpacing: '0.35em', color: MUTED }}>TSK'S</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: GOLD, lineHeight: 0.9 }}>TECH</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: '0.3em', color: 'white' }}>SERVICES</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <div style={{ width: 18, height: 1.5, background: GOLD }}/>
              <span style={{ fontSize: 7, letterSpacing: '0.2em', color: CYAN, fontWeight: 300 }}>STUDIO DIGITAL · COTONOU</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, borderTop: '1px solid rgba(200,163,37,0.1)', paddingTop: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.12em', background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CELEBRATIONS LINK
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            Crée & partage des vœux magiques pour chaque occasion ✨
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ padding: '28px 16px 0', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: MUTED, marginBottom: 16, textAlign: 'center' }}>
          Nos outils
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tools.map((tool) => (
            <div
              key={tool.path}
              onClick={() => tool.available && nav(tool.path)}
              style={{
                background: tool.available ? `linear-gradient(135deg, #0E0625, #150640)` : '#0A0318',
                border: `1px solid ${tool.available ? tool.color + '40' : '#1A0F40'}`,
                borderRadius: 14,
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: tool.available ? 'pointer' : 'default',
                opacity: tool.available ? 1 : 0.5,
                boxShadow: tool.available ? `0 4px 24px ${tool.glow}` : 'none',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 36, flexShrink: 0 }}>{tool.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.08em', color: tool.available ? tool.color : MUTED }}>
                    {tool.name}
                  </span>
                  {!tool.available && (
                    <span style={{ fontSize: 9, background: 'rgba(155,142,196,0.15)', color: MUTED, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Bientôt
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{tool.desc}</div>
              </div>
              {tool.available && (
                <div style={{ color: tool.color, fontSize: 18, flexShrink: 0 }}>›</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid #1A0F40' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: MUTED, textTransform: 'uppercase' }}>
            Propulsé par
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.2em', color: GOLD, marginTop: 4 }}>
            Tsk's Tech Services
          </div>
          <div style={{ fontSize: 11, color: '#3A2A6A', marginTop: 4 }}>
            Studio Digital · Cotonou, Bénin
          </div>
        </div>
      </div>
    </div>
  )
      }
