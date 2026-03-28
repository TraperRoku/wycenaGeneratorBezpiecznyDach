import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import dayjs from 'dayjs'

// Kolory
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
}

const S = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: C.white },
  /* ─ Header ─ */
  header:       { backgroundColor: C.orange, padding: '24 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoBox:      { width: 44, height: 44, backgroundColor: C.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoText:     { fontFamily: 'Helvetica-Bold', fontSize: 15, color: C.orange },
  compName:     { fontFamily: 'Helvetica-Bold', fontSize: 20, color: C.white, letterSpacing: 1 },
  compTag:      { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  docRight:     { alignItems: 'flex-end' },
  docType:      { fontFamily: 'Helvetica-Bold', fontSize: 20, color: C.white, letterSpacing: 2 },
  docNum:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: 'Helvetica-Bold' },
  docDates:     { fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.7 },
  /* ─ Body ─ */
  body:         { padding: '22 32' },
  parties:      { flexDirection: 'row', gap: 24, marginBottom: 22 },
  partyCol:     { flex: 1 },
  partyLabel:   { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, color: C.gray500, marginBottom: 5 },
  partyName:    { fontFamily: 'Helvetica-Bold', fontSize: 13, color: C.gray900, marginBottom: 2 },
  partyDetail:  { fontSize: 10, color: C.gray500, marginBottom: 1 },
  partyAccent:  { fontSize: 10, color: C.orange, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  divider:      { height: 3, backgroundColor: C.orange, borderRadius: 2, marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.2, color: C.orange, marginBottom: 8 },
  /* ─ Table ─ */
  tableHead:    { flexDirection: 'row', backgroundColor: C.orangeLight, padding: '7 10', borderRadius: 4, marginBottom: 0 },
  tableHeadTxt: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 },
  tableRow:     { flexDirection: 'row', padding: '9 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  tableCell:    { fontSize: 11, color: C.gray900 },
  tableCellSm:  { fontSize: 9, color: C.gray500, marginTop: 1 },
  tableBold:    { fontFamily: 'Helvetica-Bold' },
  colLp:        { width: 22 },
  colName:      { flex: 1 },
  colQty:       { width: 70, textAlign: 'right' },
  colPrice:     { width: 70, textAlign: 'right' },
  colTotal:     { width: 80, textAlign: 'right' },
  /* ─ Totals ─ */
  totalWrap:    { marginTop: 12 },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', padding: '6 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  totalLabel:   { fontSize: 11, color: C.gray500 },
  totalVal:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.gray900 },
  totalMain:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, padding: '11 14', marginTop: 6 },
  totalMainTxt: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.white },
  /* ─ Notes ─ */
  notesWrap:    { marginTop: 20 },
  noteBox:      { backgroundColor: C.orangePale, borderLeftWidth: 3, borderLeftColor: C.orange, padding: '10 12', borderRadius: 4 },
  noteText:     { fontSize: 10, color: C.gray700, lineHeight: 1.7 },
  /* ─ Signature ─ */
  sigWrap:      { flexDirection: 'row', gap: 40, marginTop: 32 },
  sigBox:       { flex: 1, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 6 },
  sigLabel:     { fontSize: 9, color: C.gray500 },
  /* ─ Footer ─ */
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.gray50, borderTopWidth: 0.5, borderTopColor: C.gray200, padding: '12 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft:   { fontSize: 9, color: C.gray500, lineHeight: 1.7 },
  footerRight:  { alignItems: 'flex-end' },
  footerBrand:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.orange, marginBottom: 2 },
  footerDetail: { fontSize: 9, color: C.gray500, lineHeight: 1.6 },
})

const fmt = (n) => Number(n).toFixed(2) + ' zł'

export default function QuotePDF({ quoteItems, client, notes, discount, calc }) {
  const today     = dayjs().format('DD.MM.YYYY')
  const validTo   = dayjs().add(parseInt(client.validDays) || 30, 'day').format('DD.MM.YYYY')
  const { net, discountAmt, netAfterDiscount, vat, vatRate, gross } = calc

  return (
    <Document
      title={`Wycena ${client.quoteNum || ''} — ${client.name || 'Klient'}`}
      author="Bezpieczny Dach"
    >
      <Page size="A4" style={S.page}>
        {/* ─── NAGŁÓWEK ─── */}
        <View style={S.header}>
          <View>
            <View style={S.logoBox}>
              <Text style={S.logoText}>BD</Text>
            </View>
            <Text style={S.compName}>BEZPIECZNY DACH</Text>
            <Text style={S.compTag}>Usługi dekarskie · Dachy płaskie · Szczecin & Goleniów</Text>
          </View>
          <View style={S.docRight}>
            <Text style={S.docType}>WYCENA</Text>
            <Text style={S.docNum}>{client.quoteNum || 'WYC/2025/001'}</Text>
            <Text style={S.docDates}>
              {`Data wystawienia: ${today}\nWażna do: ${validTo}`}
            </Text>
          </View>
        </View>

        {/* ─── BODY ─── */}
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

          {/* Kreska */}
          <View style={S.divider} />

          {/* Tabela */}
          <Text style={S.sectionTitle}>Zakres prac i kosztorys</Text>

          {/* Nagłówek tabeli */}
          <View style={S.tableHead}>
            <Text style={[S.tableHeadTxt, S.colLp]}>Lp.</Text>
            <Text style={[S.tableHeadTxt, S.colName]}>Opis</Text>
            <Text style={[S.tableHeadTxt, S.colQty]}>Ilość</Text>
            <Text style={[S.tableHeadTxt, S.colPrice]}>Cena</Text>
            <Text style={[S.tableHeadTxt, S.colTotal]}>Wartość</Text>
          </View>

          {/* Wiersze */}
          {quoteItems.map((item, i) => (
            <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCell, S.colLp, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
              <View style={S.colName}>
                <Text style={S.tableCell}>{item.name}</Text>
                <Text style={S.tableCellSm}>{item.unit}</Text>
              </View>
              <Text style={[S.tableCell, S.colQty]}>{Number(item.qty).toFixed(2)} {item.unit}</Text>
              <Text style={[S.tableCell, S.colPrice]}>{Number(item.price).toFixed(2)} zł</Text>
              <Text style={[S.tableCell, S.tableBold, S.colTotal]}>
                {Number(item.qty * item.price).toFixed(2)} zł
              </Text>
            </View>
          ))}

          {/* Podsumowanie kwot */}
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

        {/* ─── STOPKA ─── */}
        <View style={S.footer} fixed>
          <View>
            <Text style={S.footerLeft}>
              {`Wycena wystawiona: ${today}  ·  Ważna do: ${validTo}  ·  ${client.quoteNum || ''}`}
            </Text>
          </View>
          <View style={S.footerRight}>
            <Text style={S.footerBrand}>BEZPIECZNY DACH</Text>
            <Text style={S.footerDetail}>tel. 518 144 882  ·  bezpiecznydach.pl</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
