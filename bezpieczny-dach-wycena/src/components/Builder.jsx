import { useRef } from 'react'
import { useStore } from '../store'

const fmt = (n) => Number(n).toFixed(2)
const ORANGE       = '#E85D04'
const ORANGE_LIGHT = '#FFF3EB'
const GRAY_300     = '#C9C8C3'
const GRAY_500     = '#888880'
const BLUE         = '#2563eb'
const BLUE_LIGHT   = '#eff6ff'
const RED          = '#dc2626'

export default function Builder({ onGoPreview }) {
const {
  quoteItems, notes, zaliczka, hidePrices, hideTotals,
  updateQuoteItem, removeFromQuote, reorderQuoteItems,
  setNotes, setZaliczka, setHidePrices, setHideTotals, clearQuote, getCalc, saveQuote,
} = useStore()

  const dragIdx     = useRef(null)
  const dragOverIdx = useRef(null)

  const { net, vat, vatRate, gross, laborNet, matNet, zaliczka: zaliczkaCalc, doZaplaty } = getCalc()
  const anyMaterial = quoteItems.some((it) => it.hasMaterial)

  const getRowTotal = (item) => {
    const labor = parseFloat(item.price) || 0
    const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
    return item.isFlat ? labor + mat : (labor + mat) * (parseFloat(item.qty) || 0)
  }

  return (
    <div className="main-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Kreator wyceny</div>
          <div className="panel-subtitle">
            {quoteItems.length
              ? `${quoteItems.length} pozycji · ${fmt(gross)} zł brutto`
              : 'Kliknij usługi z panelu po lewej'}
          </div>
        </div>
        <div className="panel-actions">
          {quoteItems.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={() => {
                saveQuote()
                alert('✓ Wycena zapisana w historii')
              }}>💾 Zapisz</button>
              <button className="btn btn-secondary" onClick={clearQuote}>🗑 Wyczyść</button>
            </>
          )}
          <button className="btn btn-primary" onClick={onGoPreview}>Podgląd PDF →</button>
        </div>
      </div>

      {/* Globalny przełącznik: szczegółowy vs tylko cena łączna */}
      {quoteItems.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: hidePrices ? BLUE_LIGHT : ORANGE_LIGHT,
          border: `1px solid ${hidePrices ? '#bfdbfe' : '#fdd8b8'}`,
          borderRadius: 8, gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: hidePrices ? BLUE : ORANGE }}>
              {hidePrices ? '💰 PDF: tylko cena łączna' : '📋 PDF: szczegółowy (ilość × cena / jedn.)'}
            </div>
            <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>
              {hidePrices
                ? 'Klient widzi tylko nazwę i kwotę — bez metrów i cen jednostkowych'
                : 'Klient widzi ilość, cenę jednostkową i wartość każdej pozycji'}
            </div>
          </div>
          <button
            onClick={() => setHidePrices(!hidePrices)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              border: `2px solid ${hidePrices ? BLUE : ORANGE}`,
              background: hidePrices ? BLUE : ORANGE,
              color: 'white', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {hidePrices ? '← Pokaż szczegóły' : 'Ukryj ceny jedn. →'}
          </button>
        </div>
      )}

      {/* Toggle: ukryj podsumowanie */}
      {quoteItems.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: hideTotals ? '#fdf4ff' : '#f9fafb',
          border: `1px solid ${hideTotals ? '#e9d5ff' : '#e5e7eb'}`,
          borderRadius: 8, gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: hideTotals ? '#7c3aed' : GRAY_500 }}>
              {hideTotals ? '🚫 PDF: bez podsumowania cenowego' : '💰 PDF: pokazuje wartość łączną brutto'}
            </div>
            <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>
              {hideTotals
                ? 'Klient widzi tylko ceny jednostkowe — bez netto, VAT i brutto razem'
                : 'Klient widzi pełne podsumowanie: netto, VAT, brutto'}
            </div>
          </div>
          <button
            onClick={() => setHideTotals(!hideTotals)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              border: `2px solid ${hideTotals ? '#7c3aed' : GRAY_300}`,
              background: hideTotals ? '#7c3aed' : 'white',
              color: hideTotals ? 'white' : GRAY_500,
              fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {hideTotals ? '← Pokaż podsumowanie' : 'Ukryj podsumowanie →'}
          </button>
        </div>
      )}

      {quoteItems.length > 0 && anyMaterial && (
        <div style={{
          padding: '7px 14px', background: ORANGE_LIGHT,
          border: '1px solid #fdd8b8', borderRadius: 8,
          fontSize: 12, color: ORANGE, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🧱</span>
          <span>Część pozycji zawiera materiał — PDF pokaże robociznę i materiał osobno</span>
        </div>
      )}

      {/* ── Tabela wyceny ── */}
      <div className="quote-table-wrap">
        {/* Nagłówek — dodana kolumna 18px na uchwyt */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '18px 1fr 85px 110px 110px 85px 110px 36px',
          gap: 6, padding: '10px 14px',
          background: '#FFF8F4', borderBottom: '1px solid #E0DFDB',
        }}>
          <div />
          <div className="qth">Usługa / opis</div>
          <div className="qth right">Ilość</div>
          <div className="qth right">Robocizna</div>
          <div className="qth right">Materiał</div>
          <div className="qth right">Wartość</div>
          <div className="qth" style={{ textAlign: 'center' }}>Tryb</div>
          <div />
        </div>

        <div className="quote-table-body">
          {quoteItems.length === 0 ? (
            <div className="empty-quote">
              <div className="empty-quote-icon">📋</div>
              <div className="empty-quote-title">Brak pozycji</div>
              <div className="empty-quote-sub">Kliknij usługę z panelu bocznego, aby ją dodać do wyceny</div>
            </div>
          ) : (
            quoteItems.map((item, idx) => {
              const rowBg = item.isFlat ? BLUE_LIGHT : item.hasMaterial ? '#FFFAF6' : 'white'
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => { dragIdx.current = idx }}
                  onDragEnter={() => { dragOverIdx.current = idx }}
                  onDragEnd={() => {
                    if (
                      dragIdx.current !== null &&
                      dragOverIdx.current !== null &&
                      dragIdx.current !== dragOverIdx.current
                    ) {
                      reorderQuoteItems(dragIdx.current, dragOverIdx.current)
                    }
                    dragIdx.current = null
                    dragOverIdx.current = null
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '18px 1fr 90px 120px 120px 90px 120px 36px',
                    gap: 14, padding: '10px 14px',
                    borderBottom: '1px solid #F0EFEC',
                    alignItems: 'center', background: rowBg,
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                >
                  {/* ── Uchwyt drag ── */}
                  <div
                    style={{
                      color: GRAY_300, fontSize: 16, cursor: 'grab',
                      userSelect: 'none', textAlign: 'center', lineHeight: 1,
                    }}
                    title="Przeciągnij aby zmienić kolejność"
                  >
                    ⠿
                  </div>

                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-unit">
                      {item.isFlat
                        ? <span style={{ color: BLUE, fontWeight: 700, fontSize: 10 }}>RYCZAŁT</span>
                        : item.unit}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, opacity: item.isFlat ? 0.25 : 1 }}>
                    <input type="number" min="0.01" step="0.5" value={item.qty}
                      disabled={item.isFlat}
                      onChange={(e) => updateQuoteItem(idx, 'qty', e.target.value)}
                      style={{
                        textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%',
                        background: item.isFlat ? '#f0f0f0' : 'white',
                        cursor: item.isFlat ? 'not-allowed' : 'text',
                      }}
                    />
                    {!item.isFlat && <span style={{ fontSize: 10, color: GRAY_500, whiteSpace: 'nowrap' }}>{item.unit}</span>}
                  </div>

                  <div>
                    <div style={{ fontSize: 9, color: GRAY_500, marginBottom: 2 }}>
                      {item.isFlat ? 'łącznie' : '/ jedn.'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="number" min="0" step="0.5" value={item.price}
                        onChange={(e) => updateQuoteItem(idx, 'price', e.target.value)}
                        style={{
                          textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%',
                          border: item.isFlat ? `1px solid ${BLUE}` : '1px solid #E0DFDB',
                        }}
                      />
                      <span style={{ fontSize: 10, color: GRAY_500 }}>zł</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 9, color: GRAY_500, marginBottom: 2, opacity: item.hasMaterial ? 1 : 0.4 }}>
                      {item.isFlat ? 'mat. łącznie' : 'mat. / jedn.'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="number" min="0" step="0.5" value={item.materialPrice}
                        disabled={!item.hasMaterial}
                        onChange={(e) => updateQuoteItem(idx, 'materialPrice', e.target.value)}
                        style={{
                          textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%',
                          opacity: item.hasMaterial ? 1 : 0.3,
                          background: item.hasMaterial ? 'white' : '#f5f5f4',
                          cursor: item.hasMaterial ? 'text' : 'not-allowed',
                          border: item.hasMaterial ? `1px solid ${item.isFlat ? BLUE : ORANGE}` : '1px solid #E0DFDB',
                        }}
                      />
                      <span style={{ fontSize: 10, color: GRAY_500, opacity: item.hasMaterial ? 1 : 0.3 }}>zł</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: item.isFlat ? BLUE : ORANGE }}>
                    {fmt(getRowTotal(item))} zł
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={() => updateQuoteItem(idx, 'hasMaterial', !item.hasMaterial)}
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${item.hasMaterial ? ORANGE : GRAY_300}`,
                        background: item.hasMaterial ? ORANGE : 'transparent',
                        color: item.hasMaterial ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >
                      {item.hasMaterial ? '🧱 z mat.' : 'z mat.'}
                    </button>
                    <button onClick={() => updateQuoteItem(idx, 'isFlat', !item.isFlat)}
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${item.isFlat ? BLUE : GRAY_300}`,
                        background: item.isFlat ? BLUE : 'transparent',
                        color: item.isFlat ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >
                      {item.isFlat ? '💰 ryczałt' : 'ryczałt'}
                    </button>
                  </div>

                  <button className="remove-btn" onClick={() => removeFromQuote(idx)}>×</button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Uwagi ── */}
      <div className="notes-section">
        <label className="input-label">Uwagi / warunki płatności / termin realizacji</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="np. Termin realizacji: 14 dni od podpisania umowy. Płatność: 30 dni. Gwarancja: 5 lat." />
      </div>

     {quoteItems.length > 0 && (
  <div className="summary-card">
    <div className="discount-row">
      <label>Zaliczka wpłacona</label>
      <input type="number" min={0} step={100} value={zaliczka}
        onChange={(e) => setZaliczka(e.target.value)} />
      <span>zł</span>
    </div>

    {/* Struktura netto — bez zmian */}
    {/* Struktura netto z rozbiciem na robociznę i materiały */}
<div style={{ 
  background: '#FAFAF9', 
  borderBottom: '2px solid #E0DFDB', 
  padding: '12px',
  borderRadius: '8px 8px 0 0',
  marginBottom: '8px'
}}>
  <div className="summary-row-item" style={{ fontSize: '13px', opacity: 0.8 }}>
    <span className="summary-row-label">Suma robocizny (netto)</span>
    <span className="summary-row-val">{fmt(laborNet)} zł</span>
  </div>
  
  {anyMaterial && (
    <div className="summary-row-item" style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
      <span className="summary-row-label">Suma materiałów (netto)</span>
      <span className="summary-row-val">{fmt(matNet)} zł</span>
    </div>
  )}
</div>

    <div className="summary-row-item">
      <span className="summary-row-label">Wartość netto</span>
      <span className="summary-row-val">{fmt(net)} zł</span>
    </div>
    <div className="summary-row-item">
      <span className="summary-row-label">VAT ({vatRate}%)</span>
      <span className="summary-row-val">{fmt(vat)} zł</span>
    </div>
    <div className="summary-row-item">
      <span className="summary-row-label">Łącznie brutto</span>
      <span className="summary-row-val" style={{ fontWeight: 700 }}>{fmt(gross)} zł</span>
    </div>
    {zaliczkaCalc > 0 && (
      <div className="summary-row-item">
        <span className="summary-row-label">Zaliczka wpłacona</span>
        <span className="summary-row-val" style={{ color: RED }}>− {fmt(zaliczkaCalc)} zł</span>
      </div>
    )}
    <div className="summary-total-row">
      <span>DO ZAPŁATY</span>
      <span>{fmt(doZaplaty)} zł</span>
    </div>
  </div>
)}
    </div>
  )
}