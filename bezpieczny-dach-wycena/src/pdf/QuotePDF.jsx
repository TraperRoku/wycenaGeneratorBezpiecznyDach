import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from '@react-pdf/renderer'
import dayjs from 'dayjs'
import logo from '../assets/logo.png'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',    fontWeight: 700 },
  ],
})

const C = {
  orange: '#E85D04', orangeLight: '#FFF3EB', orangePale: '#FFF8F4',
  white: '#FFFFFF', gray50: '#F9F9F8', gray100: '#F0EFEC', gray200: '#E0DFDB',
  gray300: '#C9C8C3', gray500: '#888880', gray700: '#444441', gray900: '#1A1A18',
  green: '#16a34a', greenLight: '#f0fdf4',
}

const S = StyleSheet.create({
  page:         { fontFamily: 'Roboto', backgroundColor: C.white },
  header:       { backgroundColor: C.orange, padding: '24 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLogo:   { width: 120, height: 48, objectFit: 'contain', marginBottom: 8 },
  compName:     { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1 },
  compTag:      { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  docRight:     { alignItems: 'flex-end' },
  docType:      { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 2 },
  docNum:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: 'Roboto', fontWeight: 700 },
  docDates:     { fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.7 },
  body:         { padding: '22 32' },
  parties:      { flexDirection: 'row', gap: 24, marginBottom: 22 },
  partyCol:     { flex: 1 },
  partyLabel:   { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.gray500, marginBottom: 5 },
  partyName:    { fontFamily: 'Roboto', fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 2 },
  partyDetail:  { fontSize: 10, color: C.gray500, marginBottom: 1 },
  partyAccent:  { fontSize: 10, color: C.orange, fontFamily: 'Roboto', fontWeight: 700, marginTop: 2 },
  divider:      { height: 3, backgroundColor: C.orange, borderRadius: 2, marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.orange, marginBottom: 8 },
  scopeBanner:  { padding: '8 12', borderRadius: 4, marginBottom: 14, borderLeftWidth: 3 },
  scopeText:    { fontSize: 9, fontFamily: 'Roboto', fontWeight: 700 },
  /* Wspólne tabela */
  tableHead:    { flexDirection: 'row', backgroundColor: C.orangeLight, padding: '7 10', borderRadius: 4 },
  tableHeadTxt: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 },
  tableRow:     { flexDirection: 'row', padding: '9 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  tableCell:    { fontSize: 11, color: C.gray900 },
  tableCellSm:  { fontSize: 9, color: C.gray500, marginTop: 1 },
  tableBold:    { fontFamily: 'Roboto', fontWeight: 700 },
  /* Kolumny szczegółowe */
  colLp:        { width: 22 },
  colName:      { flex: 1 },
  colQty:       { width: 65, textAlign: 'right' },
  colPrice:     { width: 70, textAlign: 'right' },
  colTotal:     { width: 80, textAlign: 'right' },
  /* Kolumny z materiałem */
  colLpM:       { width: 22 },
  colNameM:     { flex: 1 },
  colQtyM:      { width: 55, textAlign: 'right' },
  colLabor:     { width: 65, textAlign: 'right' },
  colMat:       { width: 65, textAlign: 'right' },
  colTotalM:    { width: 75, textAlign: 'right' },
  /* Kolumny uproszczone (hidePrices) — tylko opis + kwota */
  colLpS:       { width: 22 },
  colNameS:     { flex: 1 },
  colTotalS:    { width: 110, textAlign: 'right' },
  /* Totals */
  totalWrap:    { marginTop: 12 },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', padding: '6 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  totalLabel:   { fontSize: 11, color: C.gray500 },
  totalVal:     { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: C.gray900 },
  totalMain:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, padding: '11 14', marginTop: 6 },
  totalMainTxt: { fontSize: 13, fontFamily: 'Roboto', fontWeight: 700, color: C.white },
  notesWrap:    { marginTop: 20 },
  noteBox:      { backgroundColor: C.orangePale, borderLeftWidth: 3, borderLeftColor: C.orange, padding: '10 12', borderRadius: 4 },
  noteText:     { fontSize: 10, color: C.gray700, lineHeight: 1.7 },
  sigWrap:      { flexDirection: 'row', gap: 40, marginTop: 32 },
  sigBox:       { flex: 1, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 6 },
  sigLabel:     { fontSize: 9, color: C.gray500 },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.gray50, borderTopWidth: 0.5, borderTopColor: C.gray200, padding: '12 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft:   { fontSize: 9, color: C.gray500, lineHeight: 1.7 },
  footerRight:  { alignItems: 'flex-end' },
  footerBrand:  { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: C.orange, marginBottom: 2 },
  footerDetail: { fontSize: 9, color: C.gray500, lineHeight: 1.6 },
})

const fmtN = (n) => Number(n).toFixed(2)
const fmt  = (n) => fmtN(n) + ' zł'

const getRowTotal = (item) => {
  const labor = parseFloat(item.price) || 0
  const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
  return item.isFlat ? labor + mat : (labor + mat) * (parseFloat(item.qty) || 0)
}

export default function QuotePDF({ quoteItems, client, notes, discount, calc, hidePrices }) {
  const today   = dayjs().format('DD.MM.YYYY')
  const validTo = dayjs().add(parseInt(client.validDays) || 30, 'day').format('DD.MM.YYYY')
  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = calc

  const anyMaterial = quoteItems.some((it) => it.hasMaterial)

  // hidePrices — globalny tryb uproszczony: tylko nazwa + kwota łączna
  // W trybie szczegółowym: 'material' lub 'normal'
  const tableMode = hidePrices ? 'simple' : anyMaterial ? 'material' : 'normal'

  const scopeText = anyMaterial
    ? 'Wycena obejmuje robociznę i materiał'
    : 'Wycena obejmuje wyłącznie robociznę'
  const scopeClr = anyMaterial ? C.orange : C.green
  const scopeBg  = anyMaterial ? C.orangePale : C.greenLight

  return (
    <Document title={`Wycena ${client.quoteNum || ''} — ${client.name || 'Klient'}`} author="Bezpieczny Dach">
      <Page size="A4" style={S.page}>
        {/* NAGŁÓWEK */}
        <View style={S.header}>
          <View>
            <Image style={S.headerLogo} src={logo} />
            <Text style={S.compName}>BEZPIECZNY DACH</Text>
            <Text style={S.compTag}>Usługi dekarskie · Dachy płaskie · Szczecin & Goleniów</Text>
          </View>
          <View style={S.docRight}>
            <Text style={S.docType}>WYCENA</Text>
            <Text style={S.docNum}>{client.quoteNum || 'WYC/2025/001'}</Text>
            <Text style={S.docDates}>{`Data wystawienia: ${today}\nWażna do: ${validTo}`}</Text>
          </View>
        </View>

        <View style={S.body}>
          {/* Strony */}
          <View style={S.parties}>
            <View style={S.partyCol}>
              <Text style={S.partyLabel}>Wykonawca</Text>
              <Text style={S.partyName}>BEZPIECZNY DACH</Text>
              <Text style={S.partyDetail}>Filip Kaźmierczak</Text>
              <Text style={S.partyDetail}>Szczecin / Goleniów, Zachodniopomorskie</Text>
              <Text style={S.partyAccent}>tel. 518 144 882</Text>
              <Text style={S.partyAccent}>bezpiecznydach.pl</Text>
            </View>
            <View style={S.partyCol}>
              <Text style={S.partyLabel}>Zleceniodawca</Text>
              <Text style={S.partyName}>{client.name || '—'}</Text>
              {client.address ? <Text style={S.partyDetail}>{client.address}</Text> : null}
              {client.phone   ? <Text style={S.partyDetail}>tel. {client.phone}</Text> : null}
              {client.email   ? <Text style={S.partyDetail}>{client.email}</Text> : null}
              {client.area    ? <Text style={S.partyDetail}>Powierzchnia dachu: {client.area} m²</Text> : null}
            </View>
          </View>

          <View style={S.divider} />

          {/* Baner zakresu */}
          <View style={[S.scopeBanner, { backgroundColor: scopeBg, borderLeftColor: scopeClr }]}>
            <Text style={[S.scopeText, { color: scopeClr }]}>{scopeText}</Text>
          </View>

          <Text style={S.sectionTitle}>Zakres prac i kosztorys</Text>

          {/* ── TRYB UPROSZCZONY: tylko nazwa + wartość łączna ── */}
          {tableMode === 'simple' && (
            <>
              <View style={S.tableHead}>
                <Text style={[S.tableHeadTxt, S.colLpS]}>Lp.</Text>
                <Text style={[S.tableHeadTxt, S.colNameS]}>Zakres prac</Text>
                <Text style={[S.tableHeadTxt, S.colTotalS]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => (
                <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, S.colLpS, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
                  <View style={S.colNameS}>
                    <Text style={S.tableCell}>{item.name}</Text>
                    {/* Pokazujemy jednostkę/powierzchnię tylko jeśli nie jest ryczałtem */}
                    {!item.isFlat && client.area
                      ? <Text style={S.tableCellSm}>pow. dachu: {client.area} m²</Text>
                      : null}
                  </View>
                  <Text style={[S.tableCell, S.tableBold, S.colTotalS]}>{fmt(getRowTotal(item))}</Text>
                </View>
              ))}
            </>
          )}

          {/* ── TRYB Z MATERIAŁEM ── */}
          {tableMode === 'material' && (
            <>
              <View style={S.tableHead}>
                <Text style={[S.tableHeadTxt, S.colLpM]}>Lp.</Text>
                <Text style={[S.tableHeadTxt, S.colNameM]}>Opis</Text>
                <Text style={[S.tableHeadTxt, S.colQtyM]}>Ilość</Text>
                <Text style={[S.tableHeadTxt, S.colLabor]}>Robocizna</Text>
                <Text style={[S.tableHeadTxt, S.colMat]}>Materiał</Text>
                <Text style={[S.tableHeadTxt, S.colTotalM]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => (
                <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, S.colLpM, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
                  <View style={S.colNameM}>
                    <Text style={S.tableCell}>{item.name}</Text>
                    <Text style={S.tableCellSm}>{item.isFlat ? 'ryczałt' : item.unit}</Text>
                  </View>
                  <Text style={[S.tableCell, S.colQtyM]}>{item.isFlat ? '—' : `${fmtN(item.qty)} ${item.unit}`}</Text>
                  <Text style={[S.tableCell, S.colLabor]}>{fmtN(item.price)} zł</Text>
                  <Text style={[S.tableCell, S.colMat]}>{item.hasMaterial ? `${fmtN(item.materialPrice)} zł` : '—'}</Text>
                  <Text style={[S.tableCell, S.tableBold, S.colTotalM]}>{fmt(getRowTotal(item))}</Text>
                </View>
              ))}
            </>
          )}

          {/* ── TRYB NORMALNY: ilość × cena / jedn. ── */}
          {tableMode === 'normal' && (
            <>
              <View style={S.tableHead}>
                <Text style={[S.tableHeadTxt, S.colLp]}>Lp.</Text>
                <Text style={[S.tableHeadTxt, S.colName]}>Opis</Text>
                <Text style={[S.tableHeadTxt, S.colQty]}>Ilość</Text>
                <Text style={[S.tableHeadTxt, S.colPrice]}>Cena / jedn.</Text>
                <Text style={[S.tableHeadTxt, S.colTotal]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => (
                <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, S.colLp, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
                  <View style={S.colName}>
                    <Text style={S.tableCell}>{item.name}</Text>
                    <Text style={S.tableCellSm}>{item.isFlat ? 'ryczałt' : item.unit}</Text>
                  </View>
                  <Text style={[S.tableCell, S.colQty]}>{item.isFlat ? '—' : `${fmtN(item.qty)} ${item.unit}`}</Text>
                  <Text style={[S.tableCell, S.colPrice]}>{item.isFlat ? '—' : `${fmtN(item.price)} zł`}</Text>
                  <Text style={[S.tableCell, S.tableBold, S.colTotal]}>{fmt(getRowTotal(item))}</Text>
                </View>
              ))}
            </>
          )}

          {/* Podsumowanie */}
          <View style={S.totalWrap}>
            <View style={S.totalRow}>
              <Text style={S.totalLabel}>Wartość netto</Text>
              <Text style={S.totalVal}>{fmt(net)}</Text>
            </View>
            {discount > 0 && (
              <>
                <View style={S.totalRow}>
                  <Text style={S.totalLabel}>Rabat ({discount}%)</Text>
                  <Text style={[S.totalVal, { color: '#dc2626' }]}>− {fmt(discountAmt)}</Text>
                </View>
                <View style={S.totalRow}>
                  <Text style={S.totalLabel}>Netto po rabacie</Text>
                  <Text style={S.totalVal}>{fmt(netAfterDiscount)}</Text>
                </View>
              </>
            )}
            <View style={S.totalRow}>
              <Text style={S.totalLabel}>VAT ({vatRate}%)</Text>
              <Text style={S.totalVal}>{fmt(vat)}</Text>
            </View>
            <View style={S.totalMain}>
              <Text style={S.totalMainTxt}>ŁĄCZNIE BRUTTO</Text>
              <Text style={S.totalMainTxt}>{fmt(gross)}</Text>
            </View>
          </View>

          {notes ? (
            <View style={S.notesWrap}>
              <Text style={S.sectionTitle}>Uwagi</Text>
              <View style={S.noteBox}><Text style={S.noteText}>{notes}</Text></View>
            </View>
          ) : null}

          <View style={S.sigWrap}>
            <View style={S.sigBox}><Text style={S.sigLabel}>Podpis Wykonawcy</Text></View>
            <View style={S.sigBox}><Text style={S.sigLabel}>Podpis Zleceniodawcy / pieczęć</Text></View>
          </View>
        </View>

        <View style={S.footer} fixed>
          <Text style={S.footerLeft}>{`Wycena wystawiona: ${today}  ·  Ważna do: ${validTo}  ·  ${client.quoteNum || ''}`}</Text>
          <View style={S.footerRight}>
            <Text style={S.footerBrand}>BEZPIECZNY DACH</Text>
            <Text style={S.footerDetail}>tel. 518 144 882  ·  bezpiecznydach.pl</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}