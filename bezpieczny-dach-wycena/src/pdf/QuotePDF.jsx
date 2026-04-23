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

// Skale czcionek i odstępów
const SCALES = {
  small:  { base: 9,  sub: 8,  th: 7,  lp: 8,  total: 10, totalMain: 11, rowPad: 5,  bodyPad: 14 },
  normal: { base: 11, sub: 9,  th: 8,  lp: 9,  total: 11, totalMain: 13, rowPad: 7,  bodyPad: 16 },
  large:  { base: 13, sub: 11, th: 9,  lp: 10, total: 13, totalMain: 15, rowPad: 9,  bodyPad: 18 },
}

const S = StyleSheet.create({
  page:         { fontFamily: 'Roboto', backgroundColor: C.white },
  header:       { backgroundColor: C.orange, padding: '24 32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLogoWrap: { backgroundColor: C.white, borderRadius: 8, padding: 6, marginBottom: 10, alignSelf: 'flex-start' },
  headerLogo:     { width: 72, height: 72, objectFit: 'contain' },
  compName:     { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1 },
  compTag:      { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  docRight:     { alignItems: 'flex-end' },
  docType:      { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 2 },
  docNum:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: 'Roboto', fontWeight: 700 },
  docDates:     { fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.7 },
  parties:      { flexDirection: 'row', gap: 24, marginBottom: 14 },
  partyCol:     { flex: 1 },
  partyLabel:   { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.gray500, marginBottom: 5 },
  partyName:    { fontFamily: 'Roboto', fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 2 },
  partyDetail:  { fontSize: 10, color: C.gray500, marginBottom: 1 },
  partyAccent:  { fontSize: 10, color: C.orange, fontFamily: 'Roboto', fontWeight: 700, marginTop: 2 },
  divider:      { height: 3, backgroundColor: C.orange, borderRadius: 2, marginBottom: 12 },
  sectionTitle: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: C.orange, marginBottom: 6 },
  scopeBanner:  { padding: '7 12', borderRadius: 4, marginBottom: 10, borderLeftWidth: 3 },
  scopeText:    { fontSize: 9, fontFamily: 'Roboto', fontWeight: 700 },

  tableHead:    { flexDirection: 'row', backgroundColor: C.orangeLight, padding: '7 10', borderRadius: 4 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  tdBold:       { fontFamily: 'Roboto', fontWeight: 700 },

  nLp:    { width: 22 },
  nName:  { flex: 1, paddingRight: 6 },
  nQty:   { width: 72, textAlign: 'right' },
  nPrice: { width: 80, textAlign: 'right' },
  nTotal: { width: 82, textAlign: 'right' },

  mLp:    { width: 22 },
  mName:  { flex: 1, paddingRight: 6 },
  mQty:   { width: 68, textAlign: 'right' },
  mLabor: { width: 80, textAlign: 'right' },
  mMat:   { width: 80, textAlign: 'right' },
  mTotal: { width: 82, textAlign: 'right' },

  sLp:    { width: 22 },
  sName:  { flex: 1 },

  qLp:    { width: 22 },
qName:  { flex: 1, paddingRight: 6 },
qQty:   { width: 110, textAlign: 'right' },
qTotal: { width: 82,  textAlign: 'right' },

  totalWrap:    { marginTop: 10 },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', padding: '5 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  totalLabel:   { color: C.gray500 },
  totalVal:     { fontFamily: 'Roboto', fontWeight: 700, color: C.gray900 },
  totalMain:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, padding: '11 14', marginTop: 6 },
  totalMainTxt: { fontFamily: 'Roboto', fontWeight: 700, color: C.white },

  notesWrap: { marginTop: 14 },
  noteBox:   { backgroundColor: C.orangePale, borderLeftWidth: 3, borderLeftColor: C.orange, padding: '10 12', borderRadius: 4 },
  noteText:  { color: C.gray700, lineHeight: 1.7 },

  sigWrap:  { flexDirection: 'row', gap: 40, marginTop: 32 },
  sigBox:   { flex: 1, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 6 },
  sigLabel: { fontSize: 9, color: C.gray500 },

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

const NormalRow = ({ item, i, sc }) => (
  <View wrap={false} style={[{ flexDirection: 'row', padding: `${sc.rowPad} 10`, borderBottomWidth: 0.5, borderBottomColor: C.gray100, alignItems: 'center' }, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[{ fontSize: sc.lp, color: C.gray500 }, S.nLp]}>{i + 1}</Text>
    <View style={S.nName}>
      <Text style={{ fontSize: sc.base, color: C.gray900 }}>{item.name}</Text>
      <Text style={{ fontSize: sc.sub, color: C.gray500, marginTop: 1 }}>{item.isFlat ? 'ryczałt' : item.unit}</Text>
    </View>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.nQty]}>
      {item.isFlat ? '—' : `${fmtN(item.qty)} ${item.unit}`}
    </Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.nPrice]}>
      {item.isFlat ? '—' : `${fmtN(item.price)} zł`}
    </Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.tdBold, S.nTotal]}>{fmt(getRowTotal(item))}</Text>
  </View>
)

const MaterialRow = ({ item, i, sc }) => (
  <View wrap={false} style={[{ flexDirection: 'row', padding: `${sc.rowPad} 10`, borderBottomWidth: 0.5, borderBottomColor: C.gray100, alignItems: 'center' }, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[{ fontSize: sc.lp, color: C.gray500 }, S.mLp]}>{i + 1}</Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.mName]}>{item.name}</Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.mQty]}>
      {item.isFlat ? 'ryczałt' : `${fmtN(item.qty)} ${item.unit}`}
    </Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.mLabor]}>
      {item.isFlat ? `${fmtN(item.price)} zł` : `${fmtN(item.price)} zł/${item.unit}`}
    </Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.mMat]}>
      {!item.hasMaterial ? '—' : item.isFlat ? `${fmtN(item.materialPrice)} zł` : `${fmtN(item.materialPrice)} zł/${item.unit}`}
    </Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.tdBold, S.mTotal]}>{fmt(getRowTotal(item))}</Text>
  </View>
)

const SimpleRow = ({ item, i, sc }) => (
  <View wrap={false} style={[{ flexDirection: 'row', padding: `${sc.rowPad} 10`, borderBottomWidth: 0.5, borderBottomColor: C.gray100, alignItems: 'center' }, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[{ fontSize: sc.lp, color: C.gray500 }, S.sLp]}>{i + 1}</Text>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.sName]}>{item.name}</Text>
  </View>
)


const QtyRow = ({ item, i, sc }) => (
  <View wrap={false} style={[
    { flexDirection: 'row', padding: `${sc.rowPad} 10`, borderBottomWidth: 0.5, borderBottomColor: C.gray100, alignItems: 'center' },
    i % 2 === 1 ? S.tableRowAlt : {}
  ]}>
    <Text style={[{ fontSize: sc.lp, color: C.gray500 }, S.qLp]}>{i + 1}</Text>
    <View style={S.qName}>
      <Text style={{ fontSize: sc.base, color: C.gray900 }}>{item.name}</Text>
      <Text style={{ fontSize: sc.sub, color: C.gray500, marginTop: 1 }}>
        {item.isFlat ? 'ryczałt' : item.unit}
      </Text>
    </View>
    <Text style={[{ fontSize: sc.base, color: C.gray900 }, S.qQty]}>
      {item.isFlat ? '—' : `${fmtN(item.qty)} ${item.unit}`}
    </Text>
  </View>
)

export default function QuotePDF({ quoteItems, client, notes, zaliczka, calc, hidePrices, hideTotals, hideFooter, pdfFontSize = 'normal' }) {
  const { net, vat, vatRate, gross, doZaplaty, laborNet, matNet } = calc
  const zaliczkaAmt = parseFloat(zaliczka) || 0
  const sc = SCALES[pdfFontSize] || SCALES.normal

  // Padding dolny body: gdy stopka widoczna rezerwujemy 64px, gdy ukryta tylko 24px
  const bodyBottomPad = hideFooter ? 24 : 64

  const anyMaterial = quoteItems.some((it) => it.hasMaterial)
  const tableMode = hidePrices === true
  ? 'simple'
  : hidePrices === 'qty'
  ? 'qty_only'
  : anyMaterial ? 'material' : 'normal'

  const scopeText = anyMaterial ? 'Wycena obejmuje robociznę i materiał' : 'Wycena obejmuje wyłącznie robociznę'
  const scopeClr  = anyMaterial ? C.orange : C.green
  const scopeBg   = anyMaterial ? C.orangePale : C.greenLight

  return (
    <Document title={`Wycena ${client.quoteNum || ''} — ${client.name || 'Klient'}`} author="Bezpieczny Dach">
      <Page size="A4" style={S.page}>

        {/* ── NAGŁÓWEK ── */}
        <View style={S.header}>
          <View>
            <View style={S.headerLogoWrap}>
              <Image style={S.headerLogo} src={logo} />
            </View>
            <Text style={S.compName}>BEZPIECZNY DACH</Text>
            <Text style={S.compTag}>Usługi dekarskie · Dachy płaskie · Szczecin & Goleniów</Text>
          </View>
          <View style={S.docRight}>
            <Text style={S.docType}>WYCENA</Text>
            <Text style={S.docNum}>{client.quoteNum || 'WYC/2025/001'}</Text>
          </View>
        </View>

        <View style={{ padding: `${sc.bodyPad} 32 ${bodyBottomPad} 32` }}>

          {/* ── STRONY ── */}
          <View style={S.parties}>
            <View style={S.partyCol}>
              <Text style={S.partyLabel}>Wykonawca</Text>
              <Text style={S.partyName}>BEZPIECZNY DACH</Text>
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

          {/* ── BANER ZAKRESU ── */}
          <View style={[S.scopeBanner, { backgroundColor: scopeBg, borderLeftColor: scopeClr }]}>
            <Text style={[S.scopeText, { color: scopeClr }]}>{scopeText}</Text>
          </View>

          <Text style={S.sectionTitle}>Zakres prac i kosztorys</Text>

          {/* ── TABELA ── */}
          {tableMode === 'simple' ? (
            <View>
              <View style={S.tableHead}>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.sLp]}>Lp.</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.sName]}>Zakres prac</Text>
              </View>
              {quoteItems.map((item, i) => <SimpleRow key={i} item={item} i={i} sc={sc} />)}
            </View>



) : tableMode === 'qty_only' ? (
  <View>
    <View style={S.tableHead}>
      <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.qLp]}>Lp.</Text>
      <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.qName]}>Opis</Text>
      <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.qQty]}>Ilość</Text>

    </View>
    {quoteItems.map((item, i) => <QtyRow key={i} item={item} i={i} sc={sc} />)}
  </View>

          ) : tableMode === 'material' ? (
            <View>
              <View style={S.tableHead}>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.mLp]}>Lp.</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.mName]}>Opis</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.mQty]}>Ilość</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.mLabor]}>Robocizna</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.mMat]}>Materiał</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.mTotal]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => <MaterialRow key={i} item={item} i={i} sc={sc} />)}
            </View>

          ) : (
            <View>
              <View style={S.tableHead}>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.nLp]}>Lp.</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 }, S.nName]}>Opis</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.nQty]}>Ilość</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.nPrice]}>Cena / jedn.</Text>
                <Text style={[{ fontSize: sc.th, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500, textAlign: 'right' }, S.nTotal]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => <NormalRow key={i} item={item} i={i} sc={sc} />)}
            </View>
          )}

          {/* ── PODSUMOWANIE ── */}
          {!hideTotals && (
            <View style={S.totalWrap} wrap={false}>
              <View style={S.totalRow}>
                <Text style={[S.totalLabel, { fontSize: sc.total }]}>Wartość netto</Text>
                <Text style={[S.totalVal, { fontSize: sc.total }]}>{fmt(net)}</Text>
              </View>
              <View style={S.totalRow}>
                <Text style={[S.totalLabel, { fontSize: sc.total }]}>VAT ({vatRate}%)</Text>
                <Text style={[S.totalVal, { fontSize: sc.total }]}>{fmt(vat)}</Text>
              </View>
              <View style={S.totalRow}>
                <Text style={[S.totalLabel, { fontSize: sc.total }]}>Łącznie brutto</Text>
                <Text style={[S.totalVal, { fontSize: sc.total }]}>{fmt(gross)}</Text>
              </View>
              {zaliczkaAmt > 0 && (
                <View style={S.totalRow}>
                  <Text style={[S.totalLabel, { fontSize: sc.total }]}>Zaliczka wpłacona</Text>
                  <Text style={[S.totalVal, { fontSize: sc.total, color: '#dc2626' }]}>− {fmt(zaliczkaAmt)}</Text>
                </View>
              )}
              <View style={S.totalMain}>
                <Text style={[S.totalMainTxt, { fontSize: sc.totalMain }]}>DO ZAPŁATY</Text>
                <Text style={[S.totalMainTxt, { fontSize: sc.totalMain }]}>{fmt(doZaplaty)}</Text>
              </View>
            </View>
          )}

          {/* ── UWAGI ── */}
          {notes ? (
            <View wrap={false} style={S.notesWrap}>
              <Text style={S.sectionTitle}>Uwagi</Text>
              <View style={S.noteBox}><Text style={[S.noteText, { fontSize: sc.sub }]}>{notes}</Text></View>
            </View>
          ) : null}
        </View>

        {/* ── STOPKA ── */}
        {!hideFooter && (
          <View style={S.footer} fixed>
            <View style={S.footerRight}>
              <Text style={S.footerBrand}>BEZPIECZNY DACH</Text>
              <Text style={S.footerDetail}>tel. 518 144 882  ·  bezpiecznydach.pl</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}