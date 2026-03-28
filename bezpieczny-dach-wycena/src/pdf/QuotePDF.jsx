import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import dayjs from 'dayjs'
import logo from '../assets/logo.png'

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
})

const C = {
  orange:      '#E85D04',
  orangeLight: '#FFF3EB',
  orangePale:  '#FFF8F4',
  white:       '#FFFFFF',
  gray50:      '#F9F9F8',
  gray100:     '#F0EFEC',
  gray200:     '#E0DFDB',
  gray300:     '#C9C8C3',
  gray500:     '#888880',
  gray700:     '#444441',
  gray900:     '#1A1A18',
  green:       '#16a34a',
  greenLight:  '#f0fdf4',
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
  /* Baner z informacją o zakresie */
  scopeBanner:  { flexDirection: 'row', alignItems: 'center', padding: '8 12', borderRadius: 4, marginBottom: 16 },
  scopeText:    { fontSize: 9, fontFamily: 'Roboto', fontWeight: 700 },
  /* Strony */
  parties:      { flexDirection: 'row', gap: 24, marginBottom: 22 },
  partyCol:     { flex: 1 },
  partyLabel:   { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.gray500, marginBottom: 5 },
  partyName:    { fontFamily: 'Roboto', fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 2 },
  partyDetail:  { fontSize: 10, color: C.gray500, marginBottom: 1 },
  partyAccent:  { fontSize: 10, color: C.orange, fontFamily: 'Roboto', fontWeight: 700, marginTop: 2 },
  divider:      { height: 3, backgroundColor: C.orange, borderRadius: 2, marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.orange, marginBottom: 8 },
  /* Tabela — tryb ŁĄCZNY (tylko cena) */
  tableHead:    { flexDirection: 'row', backgroundColor: C.orangeLight, padding: '7 10', borderRadius: 4 },
  tableHeadTxt: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 },
  tableRow:     { flexDirection: 'row', padding: '9 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  tableCell:    { fontSize: 11, color: C.gray900 },
  tableCellSm:  { fontSize: 9, color: C.gray500, marginTop: 1 },
  tableBold:    { fontFamily: 'Roboto', fontWeight: 700 },
  /* Kolumny — tryb podstawowy */
  colLp:        { width: 22 },
  colName:      { flex: 1 },
  colQty:       { width: 60, textAlign: 'right' },
  colPrice:     { width: 70, textAlign: 'right' },
  colTotal:     { width: 80, textAlign: 'right' },
  /* Kolumny — tryb z materiałem (dodatkowe kolumny) */
  colLpM:       { width: 22 },
  colNameM:     { flex: 1 },
  colQtyM:      { width: 55, textAlign: 'right' },
  colLabor:     { width: 65, textAlign: 'right' },
  colMat:       { width: 65, textAlign: 'right' },
  colTotalM:    { width: 75, textAlign: 'right' },
  /* Podwiersz z rozbiciem rob/mat */
  subRow:       { flexDirection: 'row', padding: '2 10 6 10' },
  subChip:      { fontSize: 8, color: C.gray500, marginRight: 12 },
  subChipLabel: { fontFamily: 'Roboto', fontWeight: 700, color: C.gray700 },
  /* Totals */
  totalWrap:    { marginTop: 12 },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', padding: '6 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  totalLabel:   { fontSize: 11, color: C.gray500 },
  totalVal:     { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: C.gray900 },
  totalMain:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, padding: '11 14', marginTop: 6 },
  totalMainTxt: { fontSize: 13, fontFamily: 'Roboto', fontWeight: 700, color: C.white },
  /* Notes */
  notesWrap:    { marginTop: 20 },
  noteBox:      { backgroundColor: C.orangePale, borderLeftWidth: 3, borderLeftColor: C.orange, padding: '10 12', borderRadius: 4 },
  noteText:     { fontSize: 10, color: C.gray700, lineHeight: 1.7 },
  /* Podpisy */
  sigWrap:      { flexDirection: 'row', gap: 40, marginTop: 32 },
  sigBox:       { flex: 1, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 6 },
  sigLabel:     { fontSize: 9, color: C.gray500 },
  /* Footer */
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.gray50, borderTopWidth: 0.5, borderTopColor: C.gray200, padding: '12 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft:   { fontSize: 9, color: C.gray500, lineHeight: 1.7 },
  footerRight:  { alignItems: 'flex-end' },
  footerBrand:  { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: C.orange, marginBottom: 2 },
  footerDetail: { fontSize: 9, color: C.gray500, lineHeight: 1.6 },
})

const fmtN  = (n) => Number(n).toFixed(2)
const fmt   = (n) => fmtN(n) + ' zł'

export default function QuotePDF({ quoteItems, client, notes, discount, calc }) {
  const today      = dayjs().format('DD.MM.YYYY')
  const validTo    = dayjs().add(parseInt(client.validDays) || 30, 'day').format('DD.MM.YYYY')
  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = calc

  // Czy jakakolwiek pozycja ma materiał
  const anyMaterial = quoteItems.some((it) => it.hasMaterial)

  const getRowTotal = (item) => {
    const labor = parseFloat(item.price) || 0
    const mat   = item.hasMaterial ? (parseFloat(item.materialPrice) || 0) : 0
    return (labor + mat) * (parseFloat(item.qty) || 0)
  }

  // Tekst baneru zakresu
  const scopeText = anyMaterial
    ? 'Wycena obejmuje robociznę i materiał'
    : 'Wycena obejmuje wyłącznie robociznę'
  const scopeBg   = anyMaterial ? C.orangePale  : C.greenLight
  const scopeClr  = anyMaterial ? C.orange      : C.green
  const scopeBdr  = anyMaterial ? C.orange      : C.green

  return (
    <Document
      title={`Wycena ${client.quoteNum || ''} — ${client.name || 'Klient'}`}
      author="Bezpieczny Dach"
    >
      <Page size="A4" style={S.page}>
        {/* ─── NAGŁÓWEK ─── */}
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

          {/* Baner z zakresem wyceny */}
          <View style={[S.scopeBanner, { backgroundColor: scopeBg, borderLeftWidth: 3, borderLeftColor: scopeBdr }]}>
            <Text style={[S.scopeText, { color: scopeClr }]}>
              {scopeText}
            </Text>
          </View>

          <Text style={S.sectionTitle}>Zakres prac i kosztorys</Text>

          {/* ── TABELA — tryb z materiałem (osobne kolumny Robocizna / Materiał) ── */}
          {anyMaterial ? (
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
                <View key={i}>
                  <View style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, S.colLpM, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
                    <View style={S.colNameM}>
                      <Text style={S.tableCell}>{item.name}</Text>
                      <Text style={S.tableCellSm}>{item.unit}</Text>
                    </View>
                    <Text style={[S.tableCell, S.colQtyM]}>{fmtN(item.qty)} {item.unit}</Text>
                    <Text style={[S.tableCell, S.colLabor]}>{fmtN(item.price)} zł</Text>
                    <Text style={[S.tableCell, S.colMat]}>
                      {item.hasMaterial ? `${fmtN(item.materialPrice)} zł` : '—'}
                    </Text>
                    <Text style={[S.tableCell, S.tableBold, S.colTotalM]}>
                      {fmt(getRowTotal(item))}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            /* ── TABELA — tryb tylko robocizna ── */
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
                    <Text style={S.tableCellSm}>{item.unit}</Text>
                  </View>
                  <Text style={[S.tableCell, S.colQty]}>{fmtN(item.qty)} {item.unit}</Text>
                  <Text style={[S.tableCell, S.colPrice]}>{fmtN(item.price)} zł</Text>
                  <Text style={[S.tableCell, S.tableBold, S.colTotal]}>
                    {fmt(getRowTotal(item))}
                  </Text>
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

          {/* Uwagi */}
          {notes ? (
            <View style={S.notesWrap}>
              <Text style={S.sectionTitle}>Uwagi</Text>
              <View style={S.noteBox}>
                <Text style={S.noteText}>{notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Podpisy */}
          <View style={S.sigWrap}>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Podpis Wykonawcy</Text>
            </View>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Podpis Zleceniodawcy / pieczęć</Text>
            </View>
          </View>
        </View>

        {/* Stopka */}
        <View style={S.footer} fixed>
          <Text style={S.footerLeft}>
            {`Wycena wystawiona: ${today}  ·  Ważna do: ${validTo}  ·  ${client.quoteNum || ''}`}
          </Text>
          <View style={S.footerRight}>
            <Text style={S.footerBrand}>BEZPIECZNY DACH</Text>
            <Text style={S.footerDetail}>tel. 518 144 882  ·  bezpiecznydach.pl</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}