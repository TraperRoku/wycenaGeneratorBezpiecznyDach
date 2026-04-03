import { useState } from 'react'
import { useStore } from '../store'

const fmt = (n) => Number(n).toFixed(2)
const ORANGE       = '#E85D04'
const ORANGE_LIGHT = '#FFF3EB'
const GRAY_300     = '#C9C8C3'
const GRAY_500     = '#888880'
const BLUE         = '#2563eb'
const BLUE_LIGHT   = '#eff6ff'
const GREEN        = '#16a34a'
const GREEN_LIGHT  = '#f0fdf4'
const RED          = '#dc2626'
const RED_LIGHT    = '#fef2f2'

// ── Zysk z jednej pozycji (bez VAT, przed rabatem) ──────────────────────────
const getItemProfit = (item) => {
  const qty        = item.isFlat ? 1 : (parseFloat(item.qty) || 0)
  const priceRob   = parseFloat(item.price)        || 0
  const priceMat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
  const costRob    = parseFloat(item.laborCost)    || 0
  const costMat    = item.hasMaterial ? (parseFloat(item.materialCost)  || 0) : 0
  return ((priceRob + priceMat) - (costRob + costMat)) * qty
}

export default function Builder({ onGoPreview }) {
  const {
    quoteItems, notes, discount, hidePrices, hideTotals,
    updateQuoteItem, removeFromQuote,
    setNotes, setDiscount, setHidePrices, setHideTotals, clearQuote, getCalc, saveQuote,
  } = useStore()

  const [showCosts, setShowCosts] = useState(false)

  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = getCalc()
  const anyMaterial = quoteItems.some((it) => it.hasMaterial)

  const getRowTotal = (item) => {
    const labor = parseFloat(item.price) || 0
    const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
    return item.isFlat ? labor + mat : (labor + mat) * (parseFloat(item.qty) || 0)
  }

  // ── Kalkulacja zysku ────────────────────────────────────────────────────────
  const totalProfit     = quoteItems.reduce((acc, it) => acc + getItemProfit(it), 0)
  const totalCosts      = net - totalProfit
  const profitAfterDisc = totalProfit - discountAmt   // rabat zjada zysk
  const marginPct       = netAfterDiscount > 0
    ? (profitAfterDisc / netAfterDiscount) * 100
    : 0

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
              {/* Toggle kosztów własnych */}
              <button
                className="btn btn-secondary"
                onClick={() => setShowCosts((v) => !v)}
                style={showCosts ? {
                  borderColor: GREEN, color: GREEN, background: GREEN_LIGHT,
                } : {}}
              >
                {showCosts ? '💼 Ukryj koszty' : '💼 Koszty własne'}
              </button>
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

      {/* Toggle: ukryj podsumowanie (wartość łączna brutto) */}
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 85px 110px 110px 85px 110px 36px',
          gap: 6, padding: '10px 14px',
          background: '#FFF8F4', borderBottom: '1px solid #E0DFDB',
        }}>
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
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 120px 120px 90px 120px 36px',
                  gap: 14, padding: '10px 14px',
                  borderBottom: '1px solid #F0EFEC',
                  alignItems: 'center', background: rowBg, transition: 'background 0.15s',
                }}>
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

      {/* ══════════════════════════════════════════════════════════════
          SEKCJA KOSZTÓW WŁASNYCH — widoczna tylko w Kreatorze
          Nie trafia do PDF ani do wyceny klienta
      ══════════════════════════════════════════════════════════════ */}
      {showCosts && quoteItems.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: 10,
          border: `2px solid ${GREEN}`,
          overflow: 'hidden',
        }}>
          {/* Nagłówek sekcji */}
          <div style={{
            background: GREEN_LIGHT,
            padding: '10px 16px',
            borderBottom: `1px solid #bbf7d0`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 13, color: GREEN }}>
                💼 Koszty własne — tylko dla Ciebie
              </span>
              <span style={{ fontSize: 11, color: '#15803d', marginLeft: 10 }}>
                Nie widoczne w PDF ani wycenie klienta
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#15803d' }}>
              Podaj koszt realny → zobaczysz zysk na każdej pozycji
            </span>
          </div>

          {/* Nagłówek tabeli */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 90px 90px',
            gap: 8, padding: '8px 16px',
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
          }}>
            {['Pozycja', 'Koszt rob. / jedn.', 'Koszt mat. / jedn.', 'Koszty łącznie', 'Zysk'].map((h, i) => (
              <div key={i} style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 0.7, color: '#15803d',
                textAlign: i >= 3 ? 'right' : 'left',
              }}>{h}</div>
            ))}
          </div>

          {/* Wiersze */}
          {quoteItems.map((item, idx) => {
            const qty      = item.isFlat ? 1 : (parseFloat(item.qty) || 0)
            const costRob  = parseFloat(item.laborCost)   || 0
            const costMat  = item.hasMaterial ? (parseFloat(item.materialCost) || 0) : 0
            const totalCostRow = (costRob + costMat) * qty
            const profit   = getItemProfit(item)
            const isPos    = profit >= 0

            return (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 120px 90px 90px',
                gap: 8, padding: '9px 16px',
                borderBottom: '1px solid #f0fdf4',
                alignItems: 'center',
                background: idx % 2 === 0 ? 'white' : '#fafffe',
              }}>
                {/* Nazwa */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a18' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: GRAY_500 }}>
                    {item.isFlat ? 'ryczałt' : `${fmt(parseFloat(item.qty) || 0)} ${item.unit}`}
                  </div>
                </div>

                {/* Koszt robocizny */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number" min="0" step="0.5"
                    value={item.laborCost}
                    onChange={(e) => updateQuoteItem(idx, 'laborCost', e.target.value)}
                    style={{
                      textAlign: 'right', padding: '5px 6px', fontSize: 12,
                      fontWeight: 600, width: '100%',
                      border: '1px solid #bbf7d0', borderRadius: 6,
                      background: '#f0fdf4',
                    }}
                  />
                  <span style={{ fontSize: 10, color: GRAY_500 }}>zł</span>
                </div>

                {/* Koszt materiału */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number" min="0" step="0.5"
                    value={item.materialCost}
                    disabled={!item.hasMaterial}
                    onChange={(e) => updateQuoteItem(idx, 'materialCost', e.target.value)}
                    style={{
                      textAlign: 'right', padding: '5px 6px', fontSize: 12,
                      fontWeight: 600, width: '100%',
                      border: item.hasMaterial ? '1px solid #bbf7d0' : '1px solid #E0DFDB',
                      borderRadius: 6,
                      background: item.hasMaterial ? '#f0fdf4' : '#f5f5f4',
                      opacity: item.hasMaterial ? 1 : 0.4,
                      cursor: item.hasMaterial ? 'text' : 'not-allowed',
                    }}
                  />
                  <span style={{ fontSize: 10, color: GRAY_500, opacity: item.hasMaterial ? 1 : 0.4 }}>zł</span>
                </div>

                {/* Koszty łącznie */}
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: RED }}>
                  {fmt(totalCostRow)} zł
                </div>

                {/* Zysk */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 800,
                    color: isPos ? GREEN : RED,
                  }}>
                    {isPos ? '+' : ''}{fmt(profit)} zł
                  </div>
                  {/* mini marża per pozycja */}
                  {getRowTotal(item) > 0 && (
                    <div style={{ fontSize: 10, color: isPos ? '#15803d' : RED, marginTop: 1 }}>
                      {fmt((profit / getRowTotal(item)) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Podsumowanie kosztów */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 90px 90px',
            gap: 8, padding: '10px 16px',
            background: GREEN_LIGHT,
            borderTop: `1px solid #bbf7d0`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: GREEN }}>SUMA KOSZTÓW</div>
            <div />
            <div />
            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 800, color: RED }}>
              {fmt(totalCosts)} zł
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: totalProfit >= 0 ? GREEN : RED }}>
              {totalProfit >= 0 ? '+' : ''}{fmt(totalProfit)} zł
            </div>
          </div>
        </div>
      )}

      {/* ── Uwagi ── */}
      <div className="notes-section">
        <label className="input-label">Uwagi / warunki płatności / termin realizacji</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="np. Termin realizacji: 14 dni od podpisania umowy. Płatność: 30 dni. Gwarancja: 5 lat." />
      </div>

      {/* ── Podsumowanie ── */}
      {quoteItems.length > 0 && (
        <div className="summary-card">
          <div className="discount-row">
            <label>Rabat</label>
            <input type="number" min={0} max={100} step={1} value={discount}
              onChange={(e) => setDiscount(e.target.value)} />
            <span>%</span>
          </div>
          <div className="summary-row-item">
            <span className="summary-row-label">Wartość netto</span>
            <span className="summary-row-val">{fmt(net)} zł</span>
          </div>
          {discount > 0 && (
            <>
              <div className="summary-row-item">
                <span className="summary-row-label">Rabat ({discount}%)</span>
                <span className="summary-row-val" style={{ color: RED }}>− {fmt(discountAmt)} zł</span>
              </div>
              <div className="summary-row-item">
                <span className="summary-row-label">Netto po rabacie</span>
                <span className="summary-row-val">{fmt(netAfterDiscount)} zł</span>
              </div>
            </>
          )}
          <div className="summary-row-item">
            <span className="summary-row-label">VAT ({vatRate}%)</span>
            <span className="summary-row-val">{fmt(vat)} zł</span>
          </div>
          <div className="summary-total-row">
            <span>ŁĄCZNIE BRUTTO</span>
            <span>{fmt(gross)} zł</span>
          </div>

          {/* ── Blok zysku — tylko gdy showCosts === true ── */}
          {showCosts && (
            <>
              <div style={{
                padding: '8px 16px',
                background: '#fafffe',
                borderTop: `2px solid ${GREEN}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>
                  💼 ANALIZA ZYSKU (tylko dla Ciebie)
                </span>
              </div>
              <div className="summary-row-item" style={{ background: '#fafffe' }}>
                <span className="summary-row-label">Koszty własne (netto)</span>
                <span className="summary-row-val" style={{ color: RED }}>
                  {fmt(totalCosts)} zł
                </span>
              </div>
              <div className="summary-row-item" style={{ background: '#fafffe' }}>
                <span className="summary-row-label">
                  Zysk netto{discount > 0 ? ' (po rabacie)' : ''}
                </span>
                <span className="summary-row-val" style={{
                  color: profitAfterDisc >= 0 ? GREEN : RED, fontSize: 14,
                }}>
                  {profitAfterDisc >= 0 ? '+' : ''}{fmt(profitAfterDisc)} zł
                </span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: profitAfterDisc >= 0 ? GREEN_LIGHT : RED_LIGHT,
                borderTop: `1px solid ${profitAfterDisc >= 0 ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <span style={{
                  fontWeight: 800, fontSize: 14,
                  color: profitAfterDisc >= 0 ? GREEN : RED,
                }}>MARŻA</span>
                <span style={{
                  fontWeight: 800, fontSize: 20,
                  color: profitAfterDisc >= 0 ? GREEN : RED,
                }}>
                  {fmt(marginPct)}%
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}