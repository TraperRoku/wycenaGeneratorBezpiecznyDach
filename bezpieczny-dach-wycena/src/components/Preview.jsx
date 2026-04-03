import { useState, useEffect } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { useStore } from '../store'
import QuotePDF from '../pdf/QuotePDF'
import dayjs from 'dayjs'

const fmt = (n) => Number(n).toFixed(2)

export default function Preview({ onBack }) {
  const { quoteItems, client, notes, discount, hidePrices, hideTotals, getCalc } = useStore()
  const calc = getCalc()
  const { gross } = calc
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPDF(true), 300)
    return () => clearTimeout(t)
  }, [])

  const fileName = `Wycena_${(client.name || 'klient').replace(/\s+/g, '_')}_${client.quoteNum || dayjs().format('MMYYYY')}.pdf`

  const pdfProps = { quoteItems, client, notes, discount, calc, hidePrices, hideTotals }

  return (
    <div className="preview-panel">
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
          <button className="btn btn-secondary" onClick={onBack}>← Wróć</button>
          {quoteItems.length > 0 && (
            <PDFDownloadLink
              document={<QuotePDF {...pdfProps} />}
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

      {quoteItems.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray-500)' }}>
          <div style={{ fontSize: 40 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)' }}>Brak pozycji w wycenie</div>
          <div style={{ fontSize: 13 }}>Dodaj usługi w Kreatorze, aby wygenerować PDF</div>
          <button className="btn btn-primary" onClick={onBack}>Przejdź do kreatora</button>
        </div>
      ) : showPDF ? (
        <PDFViewer width="100%" height="100%" showToolbar style={{ border: 'none', flex: 1 }}>
          <QuotePDF {...pdfProps} />
        </PDFViewer>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', fontSize: 14 }}>
          Ładowanie podglądu…
        </div>
      )}
    </div>
  )
}