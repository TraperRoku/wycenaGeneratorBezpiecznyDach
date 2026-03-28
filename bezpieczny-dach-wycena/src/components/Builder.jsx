import { useStore } from '../store'

const fmt = (n) => Number(n).toFixed(2)

const ORANGE       = '#E85D04'
const ORANGE_LIGHT = '#FFF3EB'
const GRAY_300     = '#C9C8C3'
const GRAY_500     = '#888880'

export default function Builder({ onGoPreview }) {
  const {
    quoteItems,
    notes,
    discount,
    updateQuoteItem,
    removeFromQuote,
    setNotes,
    setDiscount,
    clearQuote,
    getCalc,
  } = useStore()

  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = getCalc()

  const anyMaterial = quoteItems.some((it) => it.hasMaterial)

  const getRowTotal = (item) => {
    const labor = parseFloat(item.price) || 0
    const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
    return (labor + mat) * (parseFloat(item.qty) || 0)
  }

  return (
    <div className="main-panel">
      {/* Header */}
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
            <button className="btn btn-secondary" onClick={clearQuote}>
              🗑 Wyczyść
            </button>
          )}
          <button className="btn btn-primary" onClick={onGoPreview}>
            Podgląd PDF →
          </button>
        </div>
      </div>

      {/* Pasek informacyjny */}
      {quoteItems.length > 0 && (
        <div style={{
          padding: '8px 14px',
          background: anyMaterial ? ORANGE_LIGHT : '#f0fdf4',
          border: `1px solid ${anyMaterial ? '#fdd8b8' : '#bbf7d0'}`,
          borderRadius: 8,
          fontSize: 12,
          color: anyMaterial ? ORANGE : '#16a34a',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>{anyMaterial ? '🧱' : '🔨'}</span>
          <span>
            {anyMaterial
              ? 'Część pozycji zawiera materiał — PDF pokaże robociznę i materiał osobno'
              : 'Wycena zawiera wyłącznie robociznę — kliknij "z mat." przy pozycji aby dodać materiał'}
          </span>
        </div>
      )}

      {/* Tabela pozycji */}
      <div className="quote-table-wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 105px 105px 90px 68px 36px',
          gap: 8,
          padding: '10px 14px',
          background: '#FFF8F4',
          borderBottom: '1px solid #E0DFDB',
        }}>
          <div className="qth">Usługa / opis</div>
          <div className="qth right">Ilość</div>
          <div className="qth right">Robocizna / jedn.</div>
          <div className="qth right">Materiał / jedn.</div>
          <div className="qth right">Wartość</div>
          <div className="qth" style={{ textAlign: 'center' }}>Tryb</div>
          <div />
        </div>

        <div className="quote-table-body">
          {quoteItems.length === 0 ? (
            <div className="empty-quote">
              <div className="empty-quote-icon">📋</div>
              <div className="empty-quote-title">Brak pozycji</div>
              <div className="empty-quote-sub">
                Kliknij usługę z panelu bocznego, aby ją dodać do wyceny
              </div>
            </div>
          ) : (
            quoteItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 105px 105px 90px 68px 36px',
                  gap: 8,
                  padding: '10px 14px',
                  borderBottom: '1px solid #F0EFEC',
                  alignItems: 'center',
                  background: item.hasMaterial ? '#FFFAF6' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                {/* Nazwa + jednostka */}
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-unit">{item.unit}</div>
                </div>

                {/* Ilość */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number"
                    min="0.01"
                    step="0.5"
                    value={item.qty}
                    onChange={(e) => updateQuoteItem(idx, 'qty', e.target.value)}
                    style={{ textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%' }}
                  />
                  <span style={{ fontSize: 10, color: GRAY_500, whiteSpace: 'nowrap' }}>{item.unit}</span>
                </div>

                {/* Robocizna */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.price}
                    onChange={(e) => updateQuoteItem(idx, 'price', e.target.value)}
                    style={{ textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%' }}
                  />
                  <span style={{ fontSize: 10, color: GRAY_500 }}>zł</span>
                </div>

                {/* Materiał — szary gdy wyłączony */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.materialPrice}
                    onChange={(e) => updateQuoteItem(idx, 'materialPrice', e.target.value)}
                    disabled={!item.hasMaterial}
                    placeholder={item.hasMaterial ? '' : '—'}
                    style={{
                      textAlign: 'right',
                      padding: '5px 6px',
                      fontSize: 13,
                      fontWeight: 600,
                      width: '100%',
                      opacity: item.hasMaterial ? 1 : 0.35,
                      background: item.hasMaterial ? 'white' : '#f5f5f4',
                      cursor: item.hasMaterial ? 'text' : 'not-allowed',
                      border: item.hasMaterial ? '1px solid #E85D04' : '1px solid #E0DFDB',
                    }}
                  />
                  <span style={{ fontSize: 10, color: GRAY_500, opacity: item.hasMaterial ? 1 : 0.35 }}>zł</span>
                </div>

                {/* Wartość łączna */}
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: ORANGE }}>
                  {fmt(getRowTotal(item))} zł
                </div>

                {/* Przełącznik z mat. / bez mat. */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => updateQuoteItem(idx, 'hasMaterial', !item.hasMaterial)}
                    title={item.hasMaterial ? 'Kliknij aby usunąć materiał z wyceny' : 'Kliknij aby dodać materiał do wyceny'}
                    style={{
                      padding: '4px 7px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: `1.5px solid ${item.hasMaterial ? ORANGE : GRAY_300}`,
                      background: item.hasMaterial ? ORANGE : 'transparent',
                      color: item.hasMaterial ? 'white' : GRAY_500,
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      fontFamily: 'inherit',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.hasMaterial ? '🧱 z mat.' : 'z mat.'}
                  </button>
                </div>

                {/* Usuń */}
                <button
                  className="remove-btn"
                  title="Usuń pozycję"
                  onClick={() => removeFromQuote(idx)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Uwagi */}
      <div className="notes-section">
        <label className="input-label">Uwagi / warunki płatności / termin realizacji</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="np. Termin realizacji: 14 dni od podpisania umowy. Płatność: 30 dni. Gwarancja: 5 lat."
        />
      </div>

      {/* Podsumowanie */}
      {quoteItems.length > 0 && (
        <div className="summary-card">
          <div className="discount-row">
            <label>Rabat</label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
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
                <span className="summary-row-val" style={{ color: '#dc2626' }}>
                  − {fmt(discountAmt)} zł
                </span>
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
        </div>
      )}
    </div>
  )
}