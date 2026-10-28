import { useRef, useState } from 'react'
import { useStore } from '../store'
import readXlsxFile from 'read-excel-file/browser'

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

const NOTES_SECTION_NAME = 'PODSTAWA PO STRONIE GENERALNEGO WYKONAWCY'
const NOTES_TEMPLATES = [
  {
    id: 'crane',
    label: '＋ Dźwig z operatorem',
    subsection: 1,
    title: 'Transport pionowy materiałów – po stronie GW',
    text: `Generalny Wykonawca zapewnia dźwig wraz z operatorem do transportu pionowego materiałów na dach, bez dodatkowych kosztów po stronie Podwykonawcy.

Po stronie Podwykonawcy pozostaje:
- uzgadnianie terminów pracy dźwigu z operatorem lub koordynatorem GW,
- przygotowanie i podpinanie ładunków do transportu przez uprawnione osoby,
- odbiór i rozprowadzenie materiałów na dachu.`,
  },
  {
    id: 'container',
    label: '＋ Kontener i utylizacja',
    subsection: 2,
    title: 'Kontener na odpady i ich utylizacja – po stronie GW',
    text: `Generalny Wykonawca zapewnia kontenery na odpady budowlane, ich odbiór, wywóz oraz zgodne z przepisami zagospodarowanie, bez dodatkowych kosztów po stronie Podwykonawcy.

Po stronie Podwykonawcy pozostaje:
- bieżące segregowanie odpadów powstałych podczas prowadzonych robót,
- gromadzenie odpadów w wyznaczonych miejscach,
- transport odpadów do kontenerów zapewnionych przez GW.`,
  },
]

const parseCsv = (text) => {
  const content = text.replace(/^\uFEFF/, '')
  const firstLine = content.split(/\r?\n/).find((line) => line.trim()) || ''
  const delimiters = [';', ',', '\t']
  let delimiter = ';'
  let maxDelimiterCount = -1
  for (const candidate of delimiters) {
    let count = 0
    let inQuotes = false
    for (let index = 0; index < firstLine.length; index += 1) {
      if (firstLine[index] === '"') {
        if (inQuotes && firstLine[index + 1] === '"') index += 1
        else inQuotes = !inQuotes
      } else if (!inQuotes && firstLine[index] === candidate) {
        count += 1
      }
    }
    if (count > maxDelimiterCount) {
      delimiter = candidate
      maxDelimiterCount = count
    }
  }

  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]
    if (character === '"') {
      if (inQuotes && content[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (!inQuotes && character === delimiter) {
      row.push(field)
      field = ''
    } else if (!inQuotes && (character === '\n' || character === '\r')) {
      if (character === '\r' && content[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const csvCell = (value) => {
  const text = String(value ?? '')
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export default function Builder({ onGoPreview }) {
const {
  quoteItems, client, services, activeSectionId, notes, zaliczka, hidePrices, hideTotals, showSectionTotals,
  includeOptionsInTotal, setIncludeOptionsInTotal,
  updateQuoteItem, removeFromQuote, reorderQuoteItems, addQuoteItems,
  addSection, updateSection, removeSection, setActiveSection, setShowSectionTotals,
  setNotes, setClient, setZaliczka, setHidePrices, setHideTotals, clearQuote, getCalc, saveQuote,
  hideFooter, setHideFooter,
  summaryMode, setSummaryMode,
  pdfFontSize, setPdfFontSize,
} = useStore()

  const dragIdx     = useRef(null)
  const dragOverIdx = useRef(null)
  const importInput = useRef(null)
  const [editingNameIdx, setEditingNameIdx] = useState(null)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [csvText, setCsvText] = useState('')

  const {
    net, vat, vatRate, gross, laborNet, matNet, zaliczka: zaliczkaCalc, doZaplaty,
    optionsNet, optionsGross, combinedGross,
  } = getCalc()
  const serviceItems = quoteItems.filter((item) => item.type !== 'section')
  const anyMaterial = serviceItems.some((it) => it.hasMaterial)
  const hasMeasuredItems = serviceItems.some((item) => item.isMeasuredAfterWork === true)
  const hasPricedOptions = serviceItems.some((item) => item.isOptional === true && item.isMeasuredAfterWork !== true)

  const insertNotesTemplate = (template) => {
    if (notes.includes(template.title)) return
    const headingPattern = /^###\s+(\d+)\.\s+PODSTAWA PO STRONIE GENERALNEGO WYKONAWCY\s*$/m
    const existingHeading = notes.match(headingPattern)
    const sectionNumber = existingHeading
      ? Number(existingHeading[1])
      : quoteItems.filter((item) => item.type === 'section').length + 1
    const sectionTitle = existingHeading ? '' : `### ${sectionNumber}. ${NOTES_SECTION_NAME}\n\n`
    const templateTitle = `${sectionNumber}.${template.subsection}. ${template.title}`
    const separator = notes.trim() ? '\n\n' : ''
    setNotes(`${notes.trimEnd()}${separator}${sectionTitle}**${templateTitle}**\n\n${template.text}`)
  }

  const exportCsv = () => {
    const headers = [
      'Rodzaj', 'Klient', 'Adres', 'Telefon', 'E-mail', 'Pow. dachu (m²)', 'Nr wyceny', 'VAT',
      'Sekcja', 'Nazwa usługi', 'Ilość', 'Jednostka', 'Cena', 'Opcja', 'Wg obmiaru',
      'Ryczałt', 'Z materiałem', 'Cena materiału', 'Uwagi',
    ]
    const formatNumber = (value) => String(value ?? '').replace('.', ',')
    let activeSectionName = ''
    const rows = quoteItems.flatMap((item) => {
      const clientCells = [
        client.name, client.address, client.phone, client.email, client.area,
        client.quoteNum, client.vatRate,
      ]
      if (item.type === 'section') {
        activeSectionName = item.name || ''
        return []
      }

      return [[
        'usługa',
        ...clientCells,
        activeSectionName,
        item.name,
        item.isMeasuredAfterWork === true ? '' : formatNumber(item.qty),
        item.unit,
        formatNumber(item.price),
        item.isOptional === true ? 'tak' : 'nie',
        item.isMeasuredAfterWork === true ? 'tak' : 'nie',
        item.isFlat === true ? 'tak' : 'nie',
        item.hasMaterial === true ? 'tak' : 'nie',
        item.hasMaterial === true ? formatNumber(item.materialPrice) : '',
        '',
      ]]
    })
    if (notes.trim()) {
      const clientCells = [
        client.name, client.address, client.phone, client.email, client.area,
        client.quoteNum, client.vatRate,
      ]
      rows.push(['uwagi', ...clientCells, '', '', '', '', '', '', '', '', '', '', notes])
    }
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')}`
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    const fileName = (client.quoteNum || client.name || 'wycena')
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
      .replace(/\s+/g, '_')
    link.href = blobUrl
    link.download = `wycena_${fileName}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 0)
  }

  const importFile = async (file) => {
    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv')
      const sheets = isCsv
        ? [{ data: parseCsv(await file.text()) }]
        : await readXlsxFile(file)
      const normalize = (value) => String(value ?? '')
        .toLocaleLowerCase('pl-PL')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
      const nameHeaders = ['nazwa', 'usluga', 'opis', 'pozycja']
      const qtyHeaders = ['ilosc', 'metry', 'metraz', 'qty', 'quantity']
      const clientHeaders = {
        name: ['klient', 'klientfirma', 'nazwaklienta', 'firma'],
        address: ['adres', 'adresmiasto'],
        phone: ['telefon', 'tel'],
        email: ['email', 'mail'],
        area: ['powdachu', 'powdachum', 'powdachum2', 'powierzchniadachu', 'powierzchniadachum', 'powierzchniadachum2', 'dachm2'],
        quoteNum: ['nrwyceny', 'numerwyceny', 'quote'],
        vatRate: ['vat', 'stawkavat'],
      }
      const parseNumber = (value) => {
        let normalized = String(value ?? '').replace(/\s/g, '')
        if (normalized.includes(',') && normalized.includes('.')) {
          normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
            ? normalized.replace(/\./g, '').replace(',', '.')
            : normalized.replace(/,/g, '')
        } else {
          normalized = normalized.replace(',', '.')
        }
        return Number(normalized.replace(/[^\d.+-]/g, ''))
      }
      const parseFlag = (value) => {
        const normalized = normalize(value)
        if (['tak', 'yes', 'true', '1', 'x', 'opcja'].includes(normalized)) return true
        if (['nie', 'no', 'false', '0'].includes(normalized)) return false
        return null
      }

      const normalizedServices = services.map((service) => ({
        service,
        name: normalize(service.name),
      }))
      const imported = []
      const importedClient = {}
      let importedNotes = ''
      let skippedRows = 0
      const sheetConfigs = sheets.map((sheet) => {
        const rows = sheet.data || []
        for (let rowIndex = 0; rowIndex < Math.min(rows.length, 10); rowIndex += 1) {
          const cells = rows[rowIndex].map(normalize)
          const nameIndex = cells.findIndex((cell) => nameHeaders.some((header) => cell.includes(header)))
          const qtyIndex = cells.findIndex((cell) => qtyHeaders.some((header) => cell.includes(header)))
          const fallbackQtyIndex = qtyIndex === -1
            ? cells.findIndex((cell) => cell === 'm2' || cell.includes('powierzchnia'))
            : qtyIndex
          const clientColumns = Object.fromEntries(
            Object.entries(clientHeaders).map(([field, aliases]) => [
              field,
              cells.findIndex((cell) => aliases.includes(cell)),
            ])
          )
          const hasClientColumns = Object.values(clientColumns).some((column) => column !== -1)
          const notesColumn = cells.findIndex((cell) => ['uwagi', 'notes', 'notatki'].includes(cell))
          if ((nameIndex !== -1 && fallbackQtyIndex !== -1) || hasClientColumns || notesColumn !== -1) {
            return {
              sheet,
              rows,
              headerRow: rowIndex,
              nameColumn: nameIndex,
              qtyColumn: nameIndex === -1 ? -1 : fallbackQtyIndex,
              unitColumn: cells.findIndex((cell) => ['jedn', 'jednostka', 'unit'].includes(cell)),
              priceColumn: cells.findIndex((cell) => cell.includes('cena') || ['price', 'unitprice', 'cenajednostkowa'].includes(cell)),
              materialPriceColumn: cells.findIndex((cell) => ['cen materialu', 'cenamaterialu', 'materialprice'].includes(cell)),
              optionalColumn: cells.findIndex((cell) => ['opcja', 'optional', 'pozaprzedmiarem'].includes(cell)),
              measuredColumn: cells.findIndex((cell) => ['wgobmiaru', 'rozliczeniewgobmiaru', 'obmiar', 'iloscwgobmiaru'].includes(cell)),
              flatColumn: cells.findIndex((cell) => ['ryczalt', 'isflat', 'flat'].includes(cell)),
              materialColumn: cells.findIndex((cell) => ['zmaterialem', 'material', 'hasmaterial'].includes(cell)),
              typeColumn: cells.findIndex((cell) => ['rodzaj', 'typ', 'type'].includes(cell)),
              sectionColumn: cells.findIndex((cell) => ['sekcja', 'dzial', 'kategoria'].includes(cell)),
              notesColumn,
              clientColumns,
            }
          }
        }
        return null
      }).filter(Boolean)
      const importConfigs = sheetConfigs.length
        ? sheetConfigs
        : sheets.slice(0, 1).map((sheet) => ({
            sheet,
            rows: sheet.data || [],
            headerRow: -1,
            nameColumn: 0,
            qtyColumn: 1,
            unitColumn: -1,
            priceColumn: -1,
            materialPriceColumn: -1,
            optionalColumn: -1,
            measuredColumn: -1,
            flatColumn: -1,
            materialColumn: -1,
            typeColumn: -1,
            sectionColumn: -1,
            notesColumn: -1,
            clientColumns: {},
          }))

      for (const config of importConfigs) {
        const {
          rows, headerRow, nameColumn, qtyColumn, unitColumn, priceColumn = -1,
          materialPriceColumn = -1, optionalColumn = -1, measuredColumn = -1,
          flatColumn = -1, materialColumn = -1, typeColumn = -1, sectionColumn = -1,
          notesColumn = -1, clientColumns = {},
        } = config
        let pendingSectionNames = []
        let activeImportedSection = ''
        for (const row of rows.slice(headerRow + 1)) {
          Object.entries(clientColumns).forEach(([field, column]) => {
            const value = column === -1 ? '' : String(row[column] ?? '').trim()
            if (value) importedClient[field] = value
          })

          const rowType = typeColumn === -1 ? '' : normalize(row[typeColumn])
          const rowNotes = notesColumn === -1 ? '' : String(row[notesColumn] ?? '')
          if (rowNotes) importedNotes = rowNotes
          if (rowType === 'uwagi' || rowType === 'notes' || rowType === 'notatki') {
            continue
          }
          if (rowType === 'dzial' || rowType === 'section') {
            const sectionName = sectionColumn === -1 ? '' : String(row[sectionColumn] ?? '').trim()
            if (sectionName && sectionName !== activeImportedSection) {
              imported.push({ type: 'section', name: sectionName })
              activeImportedSection = sectionName
            }
            continue
          }

          const name = nameColumn === -1 ? '' : String(row[nameColumn] ?? '').trim()
          const quantityCell = qtyColumn === -1 ? null : row[qtyColumn]
          const quantityText = String(quantityCell ?? '').replace(/\s/g, '')
          const isOptional = optionalColumn === -1 ? false : parseFlag(row[optionalColumn]) === true
          const isMeasuredAfterWork = measuredColumn === -1 ? false : parseFlag(row[measuredColumn]) === true
          if (!name && !quantityText && !String(row[0] ?? '').trim()) continue
          if ((quantityCell == null || quantityText === '') && !isMeasuredAfterWork) {
            const heading = name || String(row[0] ?? '').trim()
            const hasClientData = Object.values(clientColumns).some((column) => column !== -1 && String(row[column] ?? '').trim())
            if (heading && !hasClientData && !/^\d+(?:[.,]\d+)?$/.test(heading)) {
              pendingSectionNames.push(heading)
            }
            continue
          }

          let normalizedQuantity = quantityText || '1'
          if (normalizedQuantity.includes(',') && normalizedQuantity.includes('.')) {
            normalizedQuantity = normalizedQuantity.lastIndexOf(',') > normalizedQuantity.lastIndexOf('.')
              ? normalizedQuantity.replace(/\./g, '').replace(',', '.')
              : normalizedQuantity.replace(/,/g, '')
          } else {
            normalizedQuantity = normalizedQuantity.replace(',', '.')
          }
          const quantityMatch = normalizedQuantity.match(/^[+-]?(?:\d+\.?\d*|\.\d+)/)
          const quantity = quantityMatch ? Number(quantityMatch[0]) : NaN
          if (!name || !Number.isFinite(quantity) || quantity <= 0) {
            skippedRows += 1
            continue
          }

          if (pendingSectionNames.length && typeColumn === -1) {
            const sectionName = pendingSectionNames.join(' — ')
            if (sectionName !== activeImportedSection) imported.push({ type: 'section', name: sectionName })
            activeImportedSection = sectionName
            pendingSectionNames = []
          }

          const rowSection = sectionColumn === -1 ? '' : String(row[sectionColumn] ?? '').trim()
          if (rowSection && rowSection !== activeImportedSection) {
            imported.push({ type: 'section', name: rowSection })
            activeImportedSection = rowSection
          }

          const match = normalizedServices.find((entry) => entry.name === normalize(name))?.service
          const rawUnit = unitColumn === -1 ? '' : String(row[unitColumn] ?? '').trim()
          const unit = normalize(rawUnit) === 'm2' ? 'm²' : rawUnit
          const priceText = priceColumn === -1 ? '' : String(row[priceColumn] ?? '').replace(/\s/g, '')
          const parsedPrice = parseNumber(priceText)
          const materialPriceText = materialPriceColumn === -1
            ? ''
            : String(row[materialPriceColumn] ?? '').replace(/\s/g, '')
          const parsedMaterialPrice = parseNumber(materialPriceText)
          const isFlat = flatColumn !== -1 && parseFlag(row[flatColumn]) === true
          const hasMaterial = materialColumn !== -1 && parseFlag(row[materialColumn]) === true
          imported.push({
            sid: match?.id ?? null,
            name: match?.name || name,
            unit: unit || match?.unit || 'm²',
            qty: quantity,
            price: priceText && Number.isFinite(parsedPrice) && parsedPrice >= 0
              ? parsedPrice
              : match?.price ?? 0,
            isFlat,
            hasMaterial,
            materialPrice: hasMaterial && Number.isFinite(parsedMaterialPrice) && parsedMaterialPrice >= 0
              ? parsedMaterialPrice
              : 0,
            isOptional,
            isMeasuredAfterWork,
          })
        }
      }

      Object.entries(importedClient).forEach(([field, value]) => setClient(field, value))
      if (importedNotes) setNotes(importedNotes)
      const importedItemCount = imported.filter((item) => item.type !== 'section').length
      if (!importedItemCount && !Object.keys(importedClient).length && !importedNotes) {
        alert('Nie znaleziono w pliku poprawnych wierszy z nazwą usługi i ilością. Użyj kolumn „Nazwa usługi” i „Ilość” (lub kolumn A i B).')
        return false
      }

      if (importedItemCount) addQuoteItems(imported)
      const result = [
        importedItemCount ? `Zaimportowano ${importedItemCount} pozycji` : '',
        Object.keys(importedClient).length ? `uzupełniono ${Object.keys(importedClient).length} pól klienta` : '',
        importedNotes ? 'zaimportowano uwagi' : '',
        skippedRows ? `pominięto ${skippedRows} niepoprawnych wierszy` : '',
      ].filter(Boolean).join('; ')
      alert(`${result}.`)
      return true
    } catch (error) {
      console.error('Nie udało się zaimportować pliku:', error)
      alert('Nie udało się odczytać pliku. Sprawdź, czy jest poprawnym plikiem CSV lub arkuszem XLSX.')
      return false
    }
  }

  const importPastedCsv = async () => {
    if (!csvText.trim()) {
      alert('Wklej najpierw zawartość pliku CSV.')
      return
    }
    const imported = await importFile(new File([csvText], 'wklejony.csv', { type: 'text/csv' }))
    if (imported) {
      setCsvText('')
      setCsvModalOpen(false)
    }
  }

  const getRowTotal = (item) => {
    if (item.isMeasuredAfterWork === true) return 0
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
          <input
            ref={importInput}
            type="file"
            accept=".xlsx,.csv,text/csv"
            aria-label="Importuj pozycje z Excela lub CSV"
            title="Wczytaj plik XLSX lub CSV z nazwami usług i ilościami"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importFile(file)
              e.target.value = ''
            }}
          />
          <button className="btn btn-secondary" onClick={() => importInput.current?.click()}>
            📥 Import Excel/CSV
          </button>
          <button className="btn btn-secondary" onClick={exportCsv} disabled={quoteItems.length === 0 && !notes.trim()}>
            📤 Eksport CSV
          </button>
          <button className="btn btn-secondary" onClick={() => setCsvModalOpen(true)}>
            📋 Wklej CSV
          </button>
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

      {csvModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCsvModalOpen(false)}>
          <div className="modal" style={{ width: 760 }}>
            <div className="modal-title">📋 Wklej dane CSV</div>
            <div className="modal-body">
              <label className="input-label" htmlFor="csv-import-text">
                Wklej tekst CSV (kolumny rozdzielone średnikami lub przecinkami)
              </label>
              <textarea
                id="csv-import-text"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={'Klient;Adres;Telefon;E-mail;Pow. dachu (m²);Nazwa usługi;Ilość;Jednostka;Cena;Opcja;Wg obmiaru\nJan Kowalski;ul. Przykładowa 1;+48 500 000 000;klient@email.pl;120;Czyszczenie dachu;;m²;5;tak;tak'}
                autoFocus
                style={{ minHeight: 280, fontFamily: 'monospace', fontSize: 12 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: GRAY_500, lineHeight: 1.5 }}>
                Rozpoznawane są też kolumny klienta: adres, telefon, e-mail, pow. dachu, nr wyceny i VAT.
                Dla rozliczenia po wykonaniu wpisz „tak” w kolumnie „Wg obmiaru”; ilość może pozostać pusta. „Opcja” jest niezależnym ustawieniem.
                Aby dodać tekst do uwag PDF, dodaj kolumnę „Rodzaj” i w osobnym wierszu wpisz „uwagi” oraz treść w kolumnie „Uwagi”.
                Wielowierszową treść CSV ujmij w podwójne cudzysłowy.
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCsvModalOpen(false)}>
                Anuluj
              </button>
              <button className="btn btn-primary" onClick={importPastedCsv}>
                Importuj pozycje
              </button>
            </div>
          </div>
        </div>
      )}

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
                key={item.id || `quote-item-${idx}`}
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
                      {editingNameIdx === idx ? (
                        <input
                          autoFocus
                          type="text"
                          aria-label="Nazwa pozycji wyceny"
                          value={item.name}
                          onChange={(e) => updateQuoteItem(idx, 'name', e.target.value)}
                          onBlur={() => setEditingNameIdx(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                            if (e.key === 'Escape') setEditingNameIdx(null)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <span onDoubleClick={() => setEditingNameIdx(idx)} title="Kliknij dwukrotnie, aby zmienić nazwę">
                            {item.name}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            title="Edytuj nazwę pozycji"
                            aria-label="Edytuj nazwę pozycji"
                            onClick={() => setEditingNameIdx(idx)}
                          >✏️</button>
                        </>
                      )}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, opacity: item.isFlat || item.isMeasuredAfterWork ? 0.6 : 1 }}>
                    {item.isMeasuredAfterWork === true ? (
                      <span style={{ width: '100%', textAlign: 'right', fontSize: 11, color: '#92400e' }}>wg obmiaru</span>
                    ) : (
                    <input type="number" min="0.01" step="0.5" value={item.qty}
                      disabled={item.isFlat}
                      onChange={(e) => updateQuoteItem(idx, 'qty', e.target.value)}
                      style={{
                        textAlign: 'right', padding: '5px 6px', fontSize: 13, fontWeight: 600, width: '100%',
                        background: item.isFlat ? '#f0f0f0' : 'white',
                        cursor: item.isFlat ? 'not-allowed' : 'text',
                      }}
                    />
                    )}
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
                    {item.isMeasuredAfterWork === true
                      ? <><span>wg obmiaru</span><span style={{ display: 'block', fontSize: 10 }}>(po wykonaniu)</span></>
                      : item.isOptional === true
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
                      disabled={item.isMeasuredAfterWork === true}
                      title={item.isMeasuredAfterWork === true ? 'Wyłącz rozliczenie wg obmiaru, aby zmienić na ryczałt' : undefined}
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        opacity: item.isMeasuredAfterWork === true ? 0.5 : 1,
                        border: `1.5px solid ${item.isFlat ? BLUE : GRAY_300}`,
                        background: item.isFlat ? BLUE : 'transparent',
                        color: item.isFlat ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >{item.isFlat ? '💰 ryczałt' : 'ryczałt'}</button>
                    <button onClick={() => {
                      const isOptional = item.isOptional !== true
                      updateQuoteItem(idx, 'isOptional', isOptional)
                    }}
                      title="Oznacz pozycję jako opcjonalną poza przedmiarem"
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${item.isOptional === true ? '#d97706' : GRAY_300}`,
                        background: item.isOptional === true ? '#d97706' : 'transparent',
                        color: item.isOptional === true ? 'white' : GRAY_500,
                        transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                      }}
                    >{item.isOptional === true ? '✓ opcja' : 'opcja'}</button>
                    {!item.isFlat && (
                      <button
                        onClick={() => updateQuoteItem(idx, 'isMeasuredAfterWork', item.isMeasuredAfterWork !== true)}
                        title="Nie podawaj ilości ani łącznej kwoty — rozliczenie po wykonaniu według faktycznego obmiaru"
                        style={{
                          padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                          border: `1.5px solid ${item.isMeasuredAfterWork === true ? '#92400e' : GRAY_300}`,
                          background: item.isMeasuredAfterWork === true ? '#92400e' : 'transparent',
                          color: item.isMeasuredAfterWork === true ? 'white' : GRAY_500,
                          transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                        }}
                      >{item.isMeasuredAfterWork === true ? '✓ wg obmiaru' : 'wg obmiaru'}</button>
                    )}
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {NOTES_TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="btn btn-secondary"
              type="button"
              onClick={() => insertNotesTemplate(template)}
              title={`Wstaw gotowy zapis: ${template.title}`}
            >
              {template.label}
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Wpisz uwagi lub skorzystaj z gotowych zapisów powyżej. Możesz je później dowolnie edytować."
          style={{ minHeight: 180, lineHeight: 1.6 }}
        />
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
          {(hasPricedOptions || hasMeasuredItems) && (
            <div style={{
              margin: '8px 0', padding: '10px 14px', border: '1px solid #fcd34d',
              borderLeft: '4px solid #d97706', borderRadius: 8, background: '#fffbeb',
            }}>
              {hasPricedOptions && (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  Opcje dodatkowe / poza przedmiarem {includeOptionsInTotal ? '(wliczone w sumę główną)' : '(nie wliczono w sumę główną)'}:
                  {' '}+ {fmt(optionsNet)} zł netto ({fmt(optionsGross)} zł brutto)
                </div>
              )}
              {hasMeasuredItems && (
                <div style={{ marginTop: 4, fontSize: 11, color: '#78350f' }}>
                  Pozycje oznaczone „wg obmiaru” zostaną rozliczone po wykonaniu i nie są wliczone do sumy wyceny.
                </div>
              )}
              {hasPricedOptions && <div style={{ marginTop: 4, fontSize: 11, color: '#78350f' }}>
                Razem z opcjami dodatkowymi: {fmt(combinedGross)} zł brutto
              </div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}