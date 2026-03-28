// ─── Wstaw swoje logo: skopiuj plik logo.png do src/assets/logo.png ───
// Jeśli plik nie istnieje, wyświetli się skrót "BD"
let logoSrc = null
try {
  logoSrc = new URL('../assets/logo.png', import.meta.url).href
} catch {
  logoSrc = null
}

const TABS = [
  { id: 'builder',  label: '📋 Kreator'      },
  { id: 'preview',  label: '🖨️ Podgląd PDF'   },
  { id: 'catalog',  label: '⚙️ Katalog usług' },
]

export default function TopBar({ tab, setTab }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        {/* ── LOGO ─────────────────────────────────────────────────
            Wrzuć logo.png do src/assets/ i odkomentuj img poniżej.
            Domyślnie wyświetla się skrót "BD".
        ─────────────────────────────────────────────────────────── */}
        <div className="topbar-logo-wrap">
          {/* <img src={logoSrc} alt="Logo Bezpieczny Dach" /> */}
          <span className="topbar-logo-fallback">BD</span>
        </div>

        <div>
          <div className="topbar-name">BEZPIECZNY DACH</div>
          <div className="topbar-sub">Generator wycen dekarskich</div>
        </div>
      </div>

      <nav className="topbar-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
