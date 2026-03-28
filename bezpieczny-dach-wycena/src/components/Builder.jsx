import { useStore } from '../store'

const fmt = (n) => Number(n).toFixed(2)

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

      {/* Tabela pozycji */}
      <div className="quote-table-wrap">
        <div className="quote-table-head">
          <div className="qth">Usługa / opis</div>
          <div className="qth right">Ilość</div>
          <div className="qth right">Cena / jedn.</div>
          <div className="qth right">Wartość</div>
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
              <div className="quote-item-row" key={idx}>
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-unit">{item.unit}</div>
                </div>

                <div className="qty-input-cell">
                  <input
                    type="number"
                    min="0.01"
                    step="0.5"
                    value={item.qty}
                    onChange={(e) => updateQuoteItem(idx, 'qty', e.target.value)}
                  />
                </div>

                <div className="price-input-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.price}
                    onChange={(e) => updateQuoteItem(idx, 'price', e.target.value)}
                  />
                </div>

                <div className="item-total">{fmt(item.qty * item.price)} zł</div>

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
            <div className="summary-row-item">
              <span className="summary-row-label">Rabat ({discount}%)</span>
              <span className="summary-row-val" style={{ color: '#dc2626' }}>
                − {fmt(discountAmt)} zł
              </span>
            </div>
          )}

          {discount > 0 && (
            <div className="summary-row-item">
              <span className="summary-row-label">Netto po rabacie</span>
              <span className="summary-row-val">{fmt(netAfterDiscount)} zł</span>
            </div>
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
