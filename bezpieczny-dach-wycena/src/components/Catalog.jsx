import { useStore } from '../store'

const fmt = (n) => Number(n).toFixed(2)

export default function Catalog({ onEdit }) {
  const { services, updateService, deleteService } = useStore()

  const cats = [...new Set(services.map((s) => s.cat))]

  const handleDelete = (svc) => {
    if (window.confirm(`Usunąć usługę "${svc.name}"?`)) {
      deleteService(svc.id)
    }
  }

  return (
    <div className="main-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Katalog usług</div>
          <div className="panel-subtitle">
            {services.length} usług · edytuj ceny i zarządzaj katalogiem
          </div>
        </div>
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={() => onEdit(null)}>
            + Dodaj usługę
          </button>
        </div>
      </div>

      <div className="catalog-table">
        <div className="catalog-head">
          <div className="qth">Nazwa usługi</div>
          <div className="qth">Jednostka</div>
          <div className="qth right">Cena bazowa</div>
          <div className="qth">Kategoria</div>
          <div className="qth right">Akcje</div>
        </div>

        {cats.map((cat) => (
          <div key={cat}>
            <div className="cat-group-header">{cat}</div>
            {services
              .filter((s) => s.cat === cat)
              .map((svc) => (
                <div className="catalog-row" key={svc.id}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{svc.unit}</div>

                  <div style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={svc.price}
                      onChange={(e) =>
                        updateService(svc.id, { price: parseFloat(e.target.value) || 0 })
                      }
                      style={{ textAlign: 'right', width: 80, padding: '4px 8px', fontSize: 13 }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 4 }}>zł</span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{svc.cat}</div>

                  <div className="flex-row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onEdit(svc)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(svc)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
