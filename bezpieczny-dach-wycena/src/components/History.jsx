import { useState } from 'react'
import { useStore } from '../store'
import dayjs from 'dayjs'

const fmt = (n) => Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function History({ onLoad }) {
  const { savedQuotes, loadQuote, moveQuote, deleteQuote } = useStore()
  const [activeFolder, setActiveFolder]   = useState(null)
  const [movingId, setMovingId]           = useState(null)
  const [moveTarget, setMoveTarget]       = useState('')

  // Zbierz unikalne foldery posortowane malejąco
  const folders = [...new Set(savedQuotes.map((q) => q.folder))].sort((a, b) => b.localeCompare(a))

  const currentFolder = activeFolder || folders[0] || null
  const visible = currentFolder
    ? savedQuotes.filter((q) => q.folder === currentFolder)
    : []

  const handleLoad = (id) => {
    if (!window.confirm('Wczytać tę wycenę? Obecna wycena zostanie zastąpiona.')) return
    loadQuote(id)
    onLoad()
  }

  const handleMove = (id) => {
    moveQuote(id, moveTarget)
    setMovingId(null)
    setMoveTarget('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── Panel folderów ── */}
      <aside style={{
        width: 200, flexShrink: 0,
        background: 'white', borderRight: '1px solid var(--gray-200)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="sec-label" style={{ marginBottom: 0 }}>Foldery</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {folders.length === 0 && (
            <div style={{ padding: '20px 8px', fontSize: 12, color: 'var(--gray-500)', textAlign: 'center' }}>
              Brak zapisanych wycen
            </div>
          )}
          {folders.map((f) => {
            const count = savedQuotes.filter((q) => q.folder === f).length
            const isActive = f === currentFolder
            return (
              <button key={f} onClick={() => setActiveFolder(f)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '9px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: isActive ? 'var(--orange-light)' : 'transparent',
                color: isActive ? 'var(--orange)' : 'var(--gray-700)',
                fontWeight: isActive ? 700 : 500, fontSize: 13,
                marginBottom: 2, transition: 'all 0.15s',
              }}>
                <span>📁 {f}</span>
                <span style={{
                  fontSize: 10, background: isActive ? 'var(--orange)' : 'var(--gray-200)',
                  color: isActive ? 'white' : 'var(--gray-500)',
                  borderRadius: 10, padding: '1px 7px', fontWeight: 700,
                }}>{count}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Lista wycen ── */}
      <div className="main-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              {currentFolder ? `Wyceny: ${currentFolder}` : 'Historia wycen'}
            </div>
            <div className="panel-subtitle">
              {savedQuotes.length === 0
                ? 'Zapisz wycenę przyciskiem w Kreatorze'
                : `${savedQuotes.length} zapisanych wycen`}
            </div>
          </div>
        </div>

        {visible.length === 0 && currentFolder && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--gray-500)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Brak wycen w tym folderze</div>
          </div>
        )}

        {visible.map((q) => (
          <div key={q.id} style={{
            background: 'white', borderRadius: 10, border: '1px solid var(--gray-200)',
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                {q.clientName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3, display: 'flex', gap: 12 }}>
                <span>{q.quoteNum}</span>
                <span>·</span>
                <span>{dayjs(q.savedAt).format('DD.MM.YYYY HH:mm')}</span>
                <span>·</span>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{fmt(q.gross)} zł</span>
              </div>
            </div>

            {/* Przenoszenie do folderu */}
            {movingId === q.id ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="text" value={moveTarget} autoFocus
                  list="folder-list"
                  onChange={(e) => setMoveTarget(e.target.value)}
                  placeholder="np. 2026/03"
                  style={{ width: 110, padding: '5px 8px', fontSize: 12 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleMove(q.id); if (e.key === 'Escape') setMovingId(null) }}
                />
                <datalist id="folder-list">
                  {folders.map((f) => <option key={f} value={f} />)}
                </datalist>
                <button className="btn btn-sm btn-primary" onClick={() => handleMove(q.id)}>✓</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setMovingId(null)}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-sm btn-secondary"
                  onClick={() => { setMovingId(q.id); setMoveTarget(q.folder) }}
                  title="Przenieś do innego folderu"
                >📁 Przenieś</button>
                <button className="btn btn-sm btn-primary"
                  onClick={() => handleLoad(q.id)}
                  title="Wczytaj tę wycenę do Kreatora"
                >↩ Wczytaj</button>
                <button className="btn btn-sm btn-danger"
                  onClick={() => deleteQuote(q.id)}
                  title="Usuń z historii"
                >×</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}