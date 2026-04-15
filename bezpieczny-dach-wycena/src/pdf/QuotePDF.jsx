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
  headerLogoWrap: { backgroundColor: C.white, borderRadius: 8, padding: 6, marginBottom: 10, alignSelf: 'flex-start' },
  headerLogo:     { width: 72, height: 72, objectFit: 'contain' },
  compName:     { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 1 },
  compTag:      { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  docRight:     { alignItems: 'flex-end' },
  docType:      { fontFamily: 'Roboto', fontWeight: 700, fontSize: 20, color: C.white, letterSpacing: 2 },
  docNum:       { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: 'Roboto', fontWeight: 700 },
  docDates:     { fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.7 },
  body:         { padding: '16 32 72 32' },
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

  /* ── Wspólna tabela ── */
  tableHead:    { flexDirection: 'row', backgroundColor: C.orangeLight, padding: '7 10', borderRadius: 4 },
  thTxt:        { fontSize: 8, fontFamily: 'Roboto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray500 },
  tableRow:     { flexDirection: 'row', padding: '7 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100, alignItems: 'center' },
  tableRowAlt:  { backgroundColor: C.gray50 },
  tdText:       { fontSize: 11, color: C.gray900 },
  tdSub:        { fontSize: 9, color: C.gray500, marginTop: 1 },
  tdBold:       { fontFamily: 'Roboto', fontWeight: 700 },

  /* ── Tryb NORMAL (robocizna, bez materiału) ── */
  //  LP   OPIS           QTY          PRICE        TOTAL
  nLp:    { width: 22 },
  nName:  { flex: 1, paddingRight: 6 },
  nQty:   { width: 72, textAlign: 'right' },
  nPrice: { width: 80, textAlign: 'right' },
  nTotal: { width: 82, textAlign: 'right' },

  /* ── Tryb MATERIAL (robocizna + materiał) ── */
  //  LP   OPIS           QTY          LABOR        MAT          TOTAL
  mLp:    { width: 22 },
  mName:  { flex: 1, paddingRight: 6 },
  mQty:   { width: 68, textAlign: 'right' },
  mLabor: { width: 80, textAlign: 'right' },
  mMat:   { width: 80, textAlign: 'right' },
  mTotal: { width: 82, textAlign: 'right' },

  /* ── Tryb SIMPLE (hidePrices) ── */
  sLp:    { width: 22 },
  sName:  { flex: 1 },

  /* ── Podsumowanie ── */
  totalWrap:    { marginTop: 10 },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', padding: '5 10', borderBottomWidth: 0.5, borderBottomColor: C.gray100 },
  totalLabel:   { fontSize: 11, color: C.gray500 },
  totalVal:     { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: C.gray900 },
  totalMain:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, padding: '11 14', marginTop: 6 },
  totalMainTxt: { fontSize: 13, fontFamily: 'Roboto', fontWeight: 700, color: C.white },

  /* ── Uwagi ── */
  notesWrap: { marginTop: 14 },
  noteBox:   { backgroundColor: C.orangePale, borderLeftWidth: 3, borderLeftColor: C.orange, padding: '10 12', borderRadius: 4 },
  noteText:  { fontSize: 10, color: C.gray700, lineHeight: 1.7 },

  /* ── Podpisy ── */
  sigWrap:  { flexDirection: 'row', gap: 40, marginTop: 32 },
  sigBox:   { flex: 1, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 6 },
  sigLabel: { fontSize: 9, color: C.gray500 },

  /* ── Stopka ── */
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

/* Komponent wiersza — czyste, jednolinijkowe komórki */
const NormalRow = ({ item, i }) => (
  <View wrap={false} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[S.tdText, S.nLp, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
    <View style={S.nName}>
      <Text style={S.tdText}>{item.name}</Text>
      {/* jednostka pod nazwą tylko w normal-mode — czytelna i nie powoduje rozbicia kolumn */}
      <Text style={S.tdSub}>{item.isFlat ? 'ryczałt' : item.unit}</Text>
    </View>
    <Text style={[S.tdText, S.nQty]}>
      {item.isFlat ? '—' : `${fmtN(item.qty)} ${item.unit}`}
    </Text>
    <Text style={[S.tdText, S.nPrice]}>
      {item.isFlat ? '—' : `${fmtN(item.price)} zł`}
    </Text>
    <Text style={[S.tdText, S.tdBold, S.nTotal]}>{fmt(getRowTotal(item))}</Text>
  </View>
)

const MaterialRow = ({ item, i }) => (
  <View wrap={false} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[S.tdText, S.mLp, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
    {/* Nazwa — bez podwójnej jednostki, bo qty już ją zawiera */}
    <Text style={[S.tdText, S.mName]}>{item.name}</Text>
    {/* Ilość z jednostką */}
    <Text style={[S.tdText, S.mQty]}>
      {item.isFlat ? 'ryczałt' : `${fmtN(item.qty)} ${item.unit}`}
    </Text>
    {/* Robocizna — cena / jedn. inline, bez drugiej linii */}
    <Text style={[S.tdText, S.mLabor]}>
      {item.isFlat
        ? `${fmtN(item.price)} zł`
        : `${fmtN(item.price)} zł/${item.unit}`}
    </Text>
    {/* Materiał — analogicznie */}
    <Text style={[S.tdText, S.mMat]}>
      {!item.hasMaterial
        ? '—'
        : item.isFlat
          ? `${fmtN(item.materialPrice)} zł`
          : `${fmtN(item.materialPrice)} zł/${item.unit}`}
    </Text>
    <Text style={[S.tdText, S.tdBold, S.mTotal]}>{fmt(getRowTotal(item))}</Text>
  </View>
)

const SimpleRow = ({ item, i }) => (
  <View wrap={false} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
    <Text style={[S.tdText, S.sLp, { color: C.gray500, fontSize: 9 }]}>{i + 1}</Text>
    <Text style={[S.tdText, S.sName]}>{item.name}</Text>
  </View>
)

export default function QuotePDF({ quoteItems, client, notes, zaliczka, calc, hidePrices, hideTotals , hideFooter }) {
  const { net, vat, vatRate, gross, doZaplaty } = calc
  const zaliczkaAmt = parseFloat(zaliczka) || 0

  const anyMaterial = quoteItems.some((it) => it.hasMaterial)
  const tableMode   = hidePrices ? 'simple' : anyMaterial ? 'material' : 'normal'

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

        <View style={S.body}>

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
                <Text style={[S.thTxt, S.sLp]}>Lp.</Text>
                <Text style={[S.thTxt, S.sName]}>Zakres prac</Text>
              </View>
              {quoteItems.map((item, i) => <SimpleRow key={i} item={item} i={i} />)}
            </View>

          ) : tableMode === 'material' ? (
            <View>
              <View style={S.tableHead}>
                <Text style={[S.thTxt, S.mLp]}>Lp.</Text>
                <Text style={[S.thTxt, S.mName]}>Opis</Text>
                <Text style={[S.thTxt, S.mQty,   { textAlign: 'right' }]}>Ilość</Text>
                <Text style={[S.thTxt, S.mLabor,  { textAlign: 'right' }]}>Robocizna</Text>
                <Text style={[S.thTxt, S.mMat,    { textAlign: 'right' }]}>Materiał</Text>
                <Text style={[S.thTxt, S.mTotal,  { textAlign: 'right' }]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => <MaterialRow key={i} item={item} i={i} />)}
            </View>

          ) : (
            <View>
              <View style={S.tableHead}>
                <Text style={[S.thTxt, S.nLp]}>Lp.</Text>
                <Text style={[S.thTxt, S.nName]}>Opis</Text>
                <Text style={[S.thTxt, S.nQty,   { textAlign: 'right' }]}>Ilość</Text>
                <Text style={[S.thTxt, S.nPrice,  { textAlign: 'right' }]}>Cena / jedn.</Text>
                <Text style={[S.thTxt, S.nTotal,  { textAlign: 'right' }]}>Wartość</Text>
              </View>
              {quoteItems.map((item, i) => <NormalRow key={i} item={item} i={i} />)}
            </View>
          )}

          {/* ── PODSUMOWANIE — ukryte gdy hideTotals ── */}
      {!hideTotals && (
  <View style={S.totalWrap} wrap={false}>
    <View style={S.totalRow}>
      <Text style={S.totalLabel}>Wartość netto</Text>
      <Text style={S.totalVal}>{fmt(net)}</Text>
    </View>
    <View style={S.totalRow}>
      <Text style={S.totalLabel}>VAT ({vatRate}%)</Text>
      <Text style={S.totalVal}>{fmt(vat)}</Text>
    </View>
    <View style={S.totalRow}>
      <Text style={S.totalLabel}>Łącznie brutto</Text>
      <Text style={S.totalVal}>{fmt(gross)}</Text>
    </View>
    {zaliczkaAmt > 0 && (
      <View style={S.totalRow}>
        <Text style={S.totalLabel}>Zaliczka wpłacona</Text>
        <Text style={[S.totalVal, { color: '#dc2626' }]}>− {fmt(zaliczkaAmt)}</Text>
      </View>
    )}
    <View style={S.totalMain}>
      <Text style={S.totalMainTxt}>DO ZAPŁATY</Text>
      <Text style={S.totalMainTxt}>{fmt(doZaplaty)}</Text>
    </View>
  </View>
)}

          {/* ── UWAGI — wrap=false żeby nie rozrywało na 2 strony ── */}
          {notes ? (
            <View wrap={false} style={S.notesWrap}>
              <Text style={S.sectionTitle}>Uwagi</Text>
              <View style={S.noteBox}><Text style={S.noteText}>{notes}</Text></View>
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