import { useStore } from '../store'

const CLIENT_FIELDS = [
  { key: 'name',      label: 'Klient / firma',      placeholder: 'Jan Kowalski lub XYZ Sp. z o.o.' },
  { key: 'address',   label: 'Adres / miasto',       placeholder: 'ul. Przykładowa 1, Szczecin'     },
  { key: 'phone',     label: 'Telefon',              placeholder: '+48 500 000 000'                  },
  { key: 'email',     label: 'E-mail',               placeholder: 'klient@email.pl'                  },
  { key: 'area',      label: 'Pow. dachu (m²)',       placeholder: 'np. 120'                          },
  { key: 'quoteNum',  label: 'Nr wyceny',             placeholder: 'WYC/06/2025/001'                  },
]

export default function Sidebar({ onAddService }) {
  const { services, quoteItems, client, setClient, addToQuote } = useStore()

  const cats = [...new Set(services.map((s) => s.cat))]
  const inQuoteIds = new Set(quoteItems.map((i) => i.sid))

  return (
    <aside className="sidebar">
      {/* ── Dane klienta ── */}
      <div className="sidebar-section">
        <div className="sec-label" style={{ marginBottom: 10 }}>Dane klienta</div>
        <div className="form-grid">
          {CLIENT_FIELDS.map((f) => (
            <div className="input-wrap" key={f.key}>
              <label className="input-label">{f.label}</label>
              <input
                type="text"
                value={client[f.key] || ''}
                placeholder={f.placeholder}
                onChange={(e) => setClient(f.key, e.target.value)}
              />
            </div>
          ))}
          <div className="input-wrap">
            <label className="input-label">Stawka VAT (%)</label>
            <select
              value={client.vatRate || 23}
              onChange={(e) => setClient('vatRate', e.target.value)}
            >
              <option value={23}>23%</option>
              <option value={8}>8%</option>
              <option value={0}>0% (zw.)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Lista usług ── */}
      <div className="sidebar-services">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="sec-label" style={{ marginBottom: 0 }}>Kliknij → dodaj do wyceny</div>
          <button className="btn btn-sm btn-secondary" onClick={onAddService}>+ Nowa</button>
        </div>

        {cats.map((cat) => (
          <div className="cat-block" key={cat}>
            <div className="cat-title">{cat}</div>
            {services
              .filter((s) => s.cat === cat)
              .map((s) => {
                const added = inQuoteIds.has(s.id)
                return (
                  <div
                    key={s.id}
                    className={`svc-chip ${added ? 'in-quote' : ''}`}
                    onClick={() => !added && addToQuote(s.id)}
                    title={added ? 'Już w wycenie' : 'Kliknij aby dodać'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="svc-chip-name">{s.name}</div>
                      <div className="svc-chip-unit">{s.unit}</div>
                    </div>
                    <div className="svc-chip-price">{s.price} zł</div>
                    {!added && (
                      <div className="svc-chip-add" aria-label="Dodaj">+</div>
                    )}
                    {added && (
                      <div style={{ fontSize: 14, color: 'var(--orange)' }}>✓</div>
                    )}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </aside>
  )
}
