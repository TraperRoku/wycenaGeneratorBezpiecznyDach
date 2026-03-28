import { useState, useEffect } from 'react'
import { useStore } from '../store'

const UNITS = ['m²', 'mb', 'szt.', 'komplet', 'godz.', 'kpl.']

export default function AddModal({ service, onClose }) {
  const { addService, updateService, services } = useStore()
  const cats = [...new Set(services.map((s) => s.cat))]

  const [form, setForm] = useState({
    name:  '',
    price: '',
    unit:  'm²',
    cat:   '',
  })

  useEffect(() => {
    if (service) {
      setForm({
        name:  service.name,
        price: service.price,
        unit:  service.unit,
        cat:   service.cat,
      })
    }
  }, [service])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) { alert('Podaj nazwę usługi'); return }
    if (!form.cat.trim())  { alert('Podaj kategorię');     return }

    const data = {
      name:  form.name.trim(),
      price: parseFloat(form.price) || 0,
      unit:  form.unit,
      cat:   form.cat.trim(),
    }

    if (service) {
      updateService(service.id, data)
    } else {
      addService(data)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          {service ? '✏️ Edytuj usługę' : '➕ Nowa usługa'}
        </div>

        <div className="modal-body">
          <div className="input-wrap">
            <label className="input-label">Nazwa usługi *</label>
            <input
              type="text"
              value={form.name}
              placeholder="np. Papa termozgrzewalna nawierzchniowa 5.2"
              autoFocus
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="form-grid cols-2">
            <div className="input-wrap">
              <label className="input-label">Cena bazowa (PLN) *</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.price}
                placeholder="0.00"
                onChange={(e) => set('price', e.target.value)}
              />
            </div>

            <div className="input-wrap">
              <label className="input-label">Jednostka</label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label">Kategoria *</label>
            {/* datalist = wpisz własną lub wybierz istniejącą */}
            <input
              type="text"
              list="cats-list"
              value={form.cat}
              placeholder="np. Papa termozgrzewalna"
              onChange={(e) => set('cat', e.target.value)}
            />
            <datalist id="cats-list">
              {cats.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Anuluj
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {service ? 'Zapisz zmiany' : 'Dodaj usługę'}
          </button>
        </div>
      </div>
    </div>
  )
}
