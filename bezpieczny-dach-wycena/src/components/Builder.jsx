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

const FONT_OPTIONS = [
  { value: 'small',  label: 'Mała',    icon: 'A', desc: 'Więcej na stronie' },
  { value: 'normal', label: 'Normalna', icon: 'A', desc: 'Domyślna' },
  { value: 'large',  label: 'Duża',    icon: 'A', desc: 'Czytelniejsza' },
]

export default function Builder({ onGoPreview }) {
const {
  quoteItems, activeSectionId, notes, zaliczka, hidePrices, hideTotals, showSectionTotals,
  includeOptionsInTotal, setIncludeOptionsInTotal,
  updateQuoteItem, removeFromQuote, reorderQuoteItems,
  addSection, updateSection, removeSection, setActiveSection, setShowSectionTotals,
  setNotes, setZaliczka, setHidePrices, setHideTotals, clearQuote, getCalc, saveQuote,
  hideFooter, setHideFooter,
  summaryMode, setSummaryMode,
  pdfFontSize, setPdfFontSize,
} = useStore()

  const dragIdx     = useRef(null)
  const dragOverIdx = useRef(null)

  const {
    net, vat, vatRate, gross, laborNet, matNet, zaliczka: zaliczkaCalc, doZaplaty,
    optionsNet, optionsGross, combinedGross,
  } = getCalc()
  const serviceItems = quoteItems.filter((item) => item.type !== 'section')
  const anyMaterial = serviceItems.some((it) => it.hasMaterial)

  const getRowTotal = (item) => {
    const labor = parseFloat(item.price) || 0
    const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
    return item.isFlat ? labor + mat : (labor + mat) * (parseFloat(item.qty) || 0)
  }

  const finishReorder = () => {
    const fromIdx = dragIdx.current
    const toIdx = dragOverIdx.current
    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      const targetIsSection = quoteItems[toIdx]?.type === 'section'
      const draggedIsService = quoteItems[fromIdx]?.type !== 'section'
      const insertIdx = targetIsSection && draggedIsService && fromIdx > toIdx
        ? toIdx + 1
        : toIdx
      reorderQuoteItems(fromIdx, insertIdx)
    }
    dragIdx.current = null
    dragOverIdx.current = null
  }

  return (
    <div className="main-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Kreator wyceny</div>
          <div className="panel-subtitle">
            {serviceItems.length
              ? `${serviceItems.length} pozycji · ${fmt(summaryMode === 'netto' ? net : gross)} zł ${summaryMode}`
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

      {/* ── Ustawienia PDF ── */}
      {quoteItems.length > 0 && (
        <div style={{
          background: 'white', border: '1px solid #E0DFDB', borderRadius: 10,
          padding: '12px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: GRAY_500, marginBottom: 10 }}>
            Ustawienia PDF
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Szczegółowość */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Widoczność cen</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
             { val: false,  label: '📋 Szczegółowy' },
             { val: 'qty',  label: '📏 Ilość' },
             { val: true,   label: '💰 Tylko kwota' },
                ].map(o => (
                  <button key={String(o.val)} onClick={() => setHidePrices(o.val)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${hidePrices === o.val ? ORANGE : GRAY_300}`,
                      background: hidePrices === o.val ? ORANGE : 'white',
                      color: hidePrices === o.val ? 'white' : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Podsumowanie */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Podsumowanie</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { val: false, label: '✅ Pokaż' },
                  { val: true,  label: '🚫 Ukryj' },
                ].map(o => (
                  <button key={String(o.val)} onClick={() => setHideTotals(o.val)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${hideTotals === o.val ? '#7c3aed' : GRAY_300}`,
                      background: hideTotals === o.val ? '#7c3aed' : 'white',
                      color: hideTotals === o.val ? 'white' : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Pozycje opcjonalne */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Pozycje opcjonalne</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { val: false, label: 'Osobno (nie wliczaj)' },
                  { val: true, label: 'Wlicz do sumy' },
                ].map((o) => (
                  <button key={String(o.val)} onClick={() => setIncludeOptionsInTotal(o.val)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${includeOptionsInTotal === o.val ? '#d97706' : GRAY_300}`,
                      background: includeOptionsInTotal === o.val ? '#d97706' : 'white',
                      color: includeOptionsInTotal === o.val ? 'white' : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Sumy działów */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Sumy działów PDF</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { val: true, label: '✅ Pokaż' },
                  { val: false, label: '🚫 Ukryj' },
                ].map(o => (
                  <button key={String(o.val)} onClick={() => setShowSectionTotals(o.val)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${showSectionTotals === o.val ? ORANGE : GRAY_300}`,
                      background: showSectionTotals === o.val ? ORANGE : 'white',
                      color: showSectionTotals === o.val ? 'white' : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Wartość w podsumowaniu: netto / brutto */}
            {!hideTotals && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Kwota w podsumowaniu</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { val: 'brutto', label: 'Brutto' },
                    { val: 'netto',  label: 'Netto' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setSummaryMode(o.val)}
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${summaryMode === o.val ? '#0d9488' : GRAY_300}`,
                        background: summaryMode === o.val ? '#0d9488' : 'white',
                        color: summaryMode === o.val ? 'white' : GRAY_500,
                      }}
                    >{o.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Stopka */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>Stopka</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { val: false, label: '✅ Pokaż' },
                  { val: true,  label: '🚫 Ukryj' },
                ].map(o => (
                  <button key={String(o.val)} onClick={() => setHideFooter(o.val)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${hideFooter === o.val ? RED : GRAY_300}`,
                      background: hideFooter === o.val ? RED : 'white',
                      color: hideFooter === o.val ? 'white' : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {/* Rozmiar czcionki */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_500, marginBottom: 5 }}>
                Rozmiar czcionki PDF
                {pdfFontSize === 'small' && <span style={{ marginLeft: 6, color: '#16a34a', fontSize: 10 }}>↑ więcej pozycji na stronie</span>}
                {pdfFontSize === 'large' && <span style={{ marginLeft: 6, color: BLUE, fontSize: 10 }}>↑ czytelniejszy druk</span>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {FONT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setPdfFontSize(o.value)}
                    title={o.desc}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontWeight: 700,
                      fontSize: o.value === 'small' ? 10 : o.value === 'large' ? 14 : 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${pdfFontSize === o.value ? ORANGE : GRAY_300}`,
                      background: pdfFontSize === o.value ? ORANGE_LIGHT : 'white',
                      color: pdfFontSize === o.value ? ORANGE : GRAY_500,
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

          </div>

          {anyMaterial && (
            <div style={{
              marginTop: 10, padding: '6px 12px', background: ORANGE_LIGHT,
              border: '1px solid #fdd8b8', borderRadius: 6,
              fontSize: 12, color: ORANGE, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>🧱</span>
              <span>Część pozycji zawiera materiał — PDF pokaże robociznę i materiał osobno</span>
            </div>
          )}
        </div>
      )}

      {/* ── Tabela wyceny ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={addSection}>＋ Dodaj dział / kategorię</button>
      </div>
      <div className="quote-table-wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '18px 1fr 90px 120px 120px 90px 120px 36px',
          gap: 14, padding: '10px 14px',
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
            if (item.type === 'section') {
              let sectionNet = 0
              for (let i = idx + 1; i < quoteItems.length && quoteItems[i].type !== 'section'; i += 1) {
                if (includeOptionsInTotal || quoteItems[i].isOptional !== true) sectionNet += getRowTotal(quoteItems[i])
              }
              const sectionGross = sectionNet * (1 + (parseFloat(vatRate) || 0) / 100)
              const isActive = activeSectionId === item.id
              return (
                <div
                  key={item.id}
                  className={`quote-section-row${isActive ? ' active' : ''}`}
                  draggable
                  onDragStart={() => { dragIdx.current = idx }}
                  onDragEnter={() => { dragOverIdx.current = idx }}
                  onDragEnd={finishReorder}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setActiveSection(item.id)}
                >
                  <div className="section-drag-handle" title="Przeciągnij dział, aby zmienić jego kolejność">::</div>
                  <input
                    aria-label="Nazwa działu"
                    value={item.name}
                    placeholder="Nazwa działu, np. Dach główny, Tarasy..."
                    onChange={(e) => updateSection(item.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="section-row-actions">
                    <span className="section-subtotal">
                      Netto {fmt(sectionNet)} zł · Brutto {fmt(sectionGross)} zł
                    </span>
                    <button
                      className={`section-active-btn${isActive ? ' selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveSection(isActive ? null : item.id) }}
                    >{isActive ? 'Aktywny' : 'Ustaw aktywny'}</button>
                  </div>
                  <button className="remove-btn" aria-label="Usuń dział (usługi zostaną zachowane)"
                    title="Usuń nagłówek działu — usługi pozostaną w wycenie"
                    onClick={(e) => { e.stopPropagation(); removeSection(item.id) }}>×</button>
                </div>
              )
            }
            const rowBg = item.isOptional === true ? '#fffbeb' : item.isFlat ? BLUE_LIGHT : item.hasMaterial ? '#FFFAF6' : 'white'
            return (
              <div
                key={item.sid}
                  draggable
                  onDragStart={() => { dragIdx.current = idx }}
                  onDragEnter={() => { dragOverIdx.current = idx }}
                  onDragEnd={finishReorder}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '18px 1fr 90px 120px 120px 90px 120px 36px',
                    gap: 14, padding: '10px 14px',
                    borderBottom: '1px solid #F0EFEC',
                    borderLeft: item.isOptional === true ? '3px dashed #d97706' : '3px solid transparent',
                    alignItems: 'center', background: rowBg,
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                >
                  <div
                    style={{
                      color: GRAY_300, fontSize: 16, cursor: 'grab',
                      userSelect: 'none', textAlign: 'center', lineHeight: 1,
                    }}
                    title="Przeciągnij aby zmienić kolejność"
                  >⠿</div>

                  <div>
                    <div className="item-name" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span>{item.name}</span>
                      {item.isOptional === true && (
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, background: '#fef3c7',
                          color: '#92400e', fontSize: 9, fontWeight: 800, letterSpacing: '0.3px',
                        }}>OPCJA / POZA PRZEDMIAREM</span>
                      )}
                    </div>
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

                  <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: item.isOptional === true ? '#b45309' : item.isFlat ? BLUE : ORANGE }}>
                    {item.isOptional === true
                      ? <><span>+ {fmt(getRowTotal(item))} zł</span><span style={{ display: 'block', fontSize: 10 }}>(opcja)</span></>
                      : `${fmt(getRowTotal(item))} zł`}
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
                    >{item.hasMaterial ? '🧱 z mat.' : 'z mat.'}</button>
                    <button onClick={() => updateQuoteItem(idx, 'isFlat', !item.isFlat)}
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${item.isFlat ? BLUE : GRAY_300}`,
                        background: item.isFlat ? BLUE : 'transparent',
                        color: item.isFlat ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >{item.isFlat ? '💰 ryczałt' : 'ryczałt'}</button>
                    <button onClick={() => updateQuoteItem(idx, 'isOptional', item.isOptional !== true)}
                      title="Oznacz pozycję jako opcjonalną poza przedmiarem"
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${item.isOptional === true ? '#d97706' : GRAY_300}`,
                        background: item.isOptional === true ? '#d97706' : 'transparent',
                        color: item.isOptional === true ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >{item.isOptional === true ? '✓ opcja' : 'opcja'}</button>
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

      {      serviceItems.length > 0 && (
        <div className="summary-card">
          <div className="discount-row">
            <label>Zaliczka wpłacona</label>
            <input type="number" min={0} step={100} value={zaliczka}
              onChange={(e) => setZaliczka(e.target.value)} />
            <span>zł</span>
          </div>

          {/* ── Rozbicie netto — tylko dla właściciela ── */}
          <div style={{
            background: '#FFF3EB',
            border: '1px solid #fdd8b8',
            borderRadius: 8,
            padding: '10px 16px',
            margin: '8px 0',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.7px', color: ORANGE, marginBottom: 8,
            }}>
              🔒 Tylko dla mnie — rozbicie netto (bez VAT)
            </div>
            <div className="summary-row-item" style={{ fontSize: 13, borderBottom: 'none', padding: '4px 0' }}>
              <span className="summary-row-label">🔨 Robocizna netto</span>
              <span className="summary-row-val" style={{ color: ORANGE }}>{fmt(laborNet)} zł</span>
            </div>
            <div className="summary-row-item" style={{ fontSize: 13, borderBottom: 'none', padding: '4px 0' }}>
              <span className="summary-row-label">🧱 Materiały netto</span>
              <span className="summary-row-val" style={{ color: ORANGE }}>{fmt(matNet)} zł</span>
            </div>
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
          {serviceItems.some((item) => item.isOptional === true) && (
            <div style={{
              margin: '8px 0', padding: '10px 14px', border: '1px solid #fcd34d',
              borderLeft: '4px solid #d97706', borderRadius: 8, background: '#fffbeb',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                Opcje dodatkowe / poza przedmiarem {includeOptionsInTotal ? '(wliczone w sumę główną)' : '(nie wliczono w sumę główną)'}:
                {' '}+ {fmt(optionsNet)} zł netto ({fmt(optionsGross)} zł brutto)
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#78350f' }}>
                Razem z opcjami dodatkowymi: {fmt(combinedGross)} zł brutto
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}