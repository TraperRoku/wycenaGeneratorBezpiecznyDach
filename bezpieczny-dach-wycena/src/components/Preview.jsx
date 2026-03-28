import { useState, useEffect } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { useStore } from '../store'
import QuotePDF from '../pdf/QuotePDF'
import dayjs from 'dayjs'

const fmt = (n) => Number(n).toFixed(2)

export default function Preview({ onBack }) {
  const { quoteItems, client, notes, discount, getCalc } = useStore()
  const calc = getCalc()
  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = calc
  const [showPDF, setShowPDF] = useState(false)

  const today  = dayjs().format('DD.MM.YYYY')
  const validTo = dayjs().add(parseInt(client.validDays) || 30, 'day').format('DD.MM.YYYY')

  // Użyj PDFViewer tylko jeśli są pozycje (oszczędność RAM)
  useEffect(() => {
    const t = setTimeout(() => setShowPDF(true), 300)
    return () => clearTimeout(t)
  }, [])

  const fileName = `Wycena_${(client.name || 'klient').replace(/\s+/g, '_')}_${client.quoteNum || dayjs().format('MMYYYY')}.pdf`

  return (
    <div className="preview-panel">
      {/* Pasek narzędzi */}
      <div className="preview-toolbar">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Podgląd wyceny PDF</div>
          {client.name && (
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              {client.name} · {client.quoteNum} · {fmt(gross)} zł brutto
            </div>
          )}
        </div>
        <div className="flex-row">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Wróć
          </button>

          {quoteItems.length > 0 && (
            <PDFDownloadLink
              document={
                <QuotePDF
                  quoteItems={quoteItems}
                  client={client}
                  notes={notes}
                  discount={discount}
                  calc={calc}
                />
              }
              fileName={fileName}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? 'Generuję…' : '⬇ Pobierz PDF'}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Treść */}
      {quoteItems.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            color: 'var(--gray-500)',
          }}
        >
          <div style={{ fontSize: 40 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)' }}>
            Brak pozycji w wycenie
          </div>
          <div style={{ fontSize: 13 }}>Dodaj usługi w Kreatorze, aby wygenerować PDF</div>
          <button className="btn btn-primary" onClick={onBack}>
            Przejdź do kreatora
          </button>
        </div>
      ) : showPDF ? (
        /* PDFViewer — wbudowany podgląd w przeglądarce */
        <PDFViewer width="100%" height="100%" showToolbar style={{ border: 'none', flex: 1 }}>
          <QuotePDF
            quoteItems={quoteItems}
            client={client}
            notes={notes}
            discount={discount}
            calc={calc}
          />
        </PDFViewer>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gray-500)',
            fontSize: 14,
          }}
        >
          Ładowanie podglądu…
        </div>
      )}
    </div>
  )
}
