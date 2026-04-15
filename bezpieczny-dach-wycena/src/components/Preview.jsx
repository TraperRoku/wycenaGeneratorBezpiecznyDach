import { useState, useEffect } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { useStore } from '../store'
import QuotePDF from '../pdf/QuotePDF'
import dayjs from 'dayjs'

const fmt = (n) => Number(n).toFixed(2)

const FONT_OPTIONS = [
  { value: 'small',  label: 'A',  title: 'Mała czcionka (więcej na stronie)' },
  { value: 'normal', label: 'A',  title: 'Normalna czcionka' },
  { value: 'large',  label: 'A',  title: 'Duża czcionka (czytelniejsza)' },
]

export default function Preview({ onBack }) {
  const { quoteItems, client, notes, zaliczka, hidePrices, hideTotals, hideFooter, pdfFontSize, setPdfFontSize, getCalc } = useStore()
  const calc = getCalc()
  const { gross } = calc
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPDF(true), 300)
    return () => clearTimeout(t)
  }, [])

  // Przeładuj PDF po zmianie ustawień
  useEffect(() => {
    setShowPDF(false)
    const t = setTimeout(() => setShowPDF(true), 200)
    return () => clearTimeout(t)
  }, [hidePrices, hideTotals, hideFooter, pdfFontSize])

  const fileName = `Wycena_${(client.name || 'klient').replace(/\s+/g, '_')}_${client.quoteNum || dayjs().format('MMYYYY')}.pdf`
  const pdfProps = { quoteItems, client, notes, zaliczka, calc, hidePrices, hideTotals, hideFooter, pdfFontSize }

  const ORANGE  = '#E85D04'
  const GRAY_300 = '#C9C8C3'
  const GRAY_500 = '#888880'

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
        <div className="flex-row" style={{ gap: 12 }}>

          {/* Rozmiar czcionki */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: GRAY_500, fontWeight: 600 }}>Czcionka:</span>
            <div style={{ display: 'flex', gap: 3, background: '#f5f5f4', borderRadius: 8, padding: 3 }}>
              {FONT_OPTIONS.map((o, i) => (
                <button key={o.value} onClick={() => setPdfFontSize(o.value)}
                  title={o.title}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontFamily: 'serif', fontWeight: 700,
                    fontSize: i === 0 ? 10 : i === 2 ? 15 : 12,
                    background: pdfFontSize === o.value ? ORANGE : 'transparent',
                    color: pdfFontSize === o.value ? 'white' : GRAY_500,
                  }}
                >{o.label}</button>
              ))}
            </div>
          </div>

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