import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SERVICES } from '../data/services'
import dayjs from 'dayjs'

const freshQuoteNum = () => {
  const d = dayjs()
  return `WYC/${d.format('MM')}/${d.format('YYYY')}/001`
}

const insertIntoActiveSection = (quoteItems, activeSectionId, items) => {
  const nextItems = [...quoteItems]
  const sectionIdx = nextItems.findIndex(
    (item) => item.type === 'section' && item.id === activeSectionId
  )
  if (sectionIdx === -1) return [...nextItems, ...items]

  let insertAt = sectionIdx + 1
  while (insertAt < nextItems.length && nextItems[insertAt].type !== 'section') insertAt += 1
  nextItems.splice(insertAt, 0, ...items)
  return nextItems
}

const newQuoteItemId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useStore = create(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,

      hideFooter: true,
      setHideFooter: (val) => set({ hideFooter: val }),

      addService: (svc) => {
        let newId;
        set((s) => {
          const maxId = s.services.reduce((m, sv) => Math.max(m, sv.id), 0)
          newId = maxId + 1
          return { services: [...s.services, { ...svc, id: newId }] }
        })
        return newId;
      },

      updateService: (id, data) =>
        set((s) => ({
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...data } : sv)),
          quoteItems: s.quoteItems.map((item) =>
            item.type !== 'section' && item.sid === id
              ? { ...item, name: data.name, price: data.price }
              : item
          ),
        })),

      deleteService: (id) =>
        set((s) => ({
          services: s.services.filter((sv) => sv.id !== id),
          quoteItems: s.quoteItems.filter((i) => i.sid !== id),
        })),

      quoteItems: [],
      activeSectionId: null,
      client: {
        name: '', address: '', phone: '', email: '', area: '',
        quoteNum: freshQuoteNum(), validDays: 30, vatRate: 23,
      },
      notes: '',
      zaliczka: 0,
      hidePrices: false,
      hideTotals: false,
      showSectionTotals: true,
      includeOptionsInTotal: false,
      summaryMode: 'netto', // 'brutto' | 'netto' — który wariant kwoty pokazujemy w podsumowaniu
      pdfFontSize: 'normal', // 'small' | 'normal' | 'large'
      documentType: 'Wycena', // 'Wycena' | 'Kosztorys'

      setClient: (field, val) =>
        set((s) => ({ client: { ...s.client, [field]: val } })),
      setNotes: (val) => set({ notes: val }),
      setZaliczka: (val) => set({ zaliczka: parseFloat(val) || 0 }),
      setHidePrices: (val) => set({ hidePrices: val }),
      setHideTotals: (val) => set({ hideTotals: val }),
      setShowSectionTotals: (val) => set({ showSectionTotals: val }),
      setIncludeOptionsInTotal: (val) => set({ includeOptionsInTotal: val }),
      setSummaryMode: (val) => set({ summaryMode: val }),
      setPdfFontSize: (val) => set({ pdfFontSize: val }),
      setDocumentType: (val) => set({ documentType: val }),

      addToQuote: (serviceId) => {
        const { services, quoteItems, activeSectionId } = get()
        const svc = services.find((s) => s.id === serviceId)
        if (!svc) return
        const newItem = {
          id: newQuoteItemId(), type: 'item',
          sid: serviceId, name: svc.name, unit: svc.unit,
          qty: 1, price: svc.price,
          hasMaterial: false, materialPrice: 0,
          isFlat: false, isOptional: false,
        }
        set({ quoteItems: insertIntoActiveSection(quoteItems, activeSectionId, [newItem]) })
      },

      addQuoteItems: (items) => {
        if (!items.length) return
        const { quoteItems, activeSectionId } = get()
        const newItems = items.map((item) => item.type === 'section'
          ? { id: newQuoteItemId(), type: 'section', name: item.name }
          : {
              id: newQuoteItemId(),
              type: 'item',
              hasMaterial: false,
              materialPrice: 0,
              isFlat: false,
              isOptional: false,
              ...item,
            })
        set({ quoteItems: insertIntoActiveSection(quoteItems, activeSectionId, newItems) })
      },

      addSection: () => {
        const { quoteItems } = get()
        const id = `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const count = quoteItems.filter((item) => item.type === 'section').length + 1
        set({
          quoteItems: [...quoteItems, { type: 'section', id, name: `${count}. Nowy dział` }],
          activeSectionId: id,
        })
      },

      updateSection: (id, name) =>
        set((s) => ({
          quoteItems: s.quoteItems.map((item) =>
            item.type === 'section' && item.id === id ? { ...item, name } : item
          ),
        })),

      removeSection: (id) =>
        set((s) => ({
          quoteItems: s.quoteItems.filter((item) => !(item.type === 'section' && item.id === id)),
          activeSectionId: s.activeSectionId === id ? null : s.activeSectionId,
        })),

      setActiveSection: (id) => set({ activeSectionId: id }),

      removeFromQuote: (idx) =>
        set((s) => ({ quoteItems: s.quoteItems.filter((_, i) => i !== idx) })),

      reorderQuoteItems: (fromIdx, toIdx) =>
        set((s) => {
          const items = [...s.quoteItems]
          const [moved] = items.splice(fromIdx, 1)
          items.splice(toIdx, 0, moved)
          return { quoteItems: items }
        }),

      updateQuoteItem: (idx, field, val) =>
        set((s) => ({
          quoteItems: s.quoteItems.map((it, i) => {
            if (i !== idx) return it
            return { ...it, [field]: val }
          }),
        })),

      clearQuote: () =>
        set({
          quoteItems: [], activeSectionId: null, notes: '', zaliczka: 0,
          hidePrices: false, hideTotals: false, showSectionTotals: true, hideFooter: true,
          includeOptionsInTotal: false,
          summaryMode: 'netto',
          pdfFontSize: 'normal',
          documentType: 'Wycena',
          client: {
            name: '', address: '', phone: '', email: '', area: '',
            quoteNum: freshQuoteNum(), validDays: 30, vatRate: 23,
          },
        }),

      getCalc: () => {
        const { quoteItems, client, zaliczka, includeOptionsInTotal } = get()
        const items = quoteItems.filter((item) => item.type !== 'section')

        const sumLabor = (selectedItems) => selectedItems.reduce((acc, it) => {
          if (it.isMeasuredAfterWork === true) return acc
          const labor = parseFloat(it.price) || 0
          return acc + (it.isFlat ? labor : labor * (parseFloat(it.qty) || 0))
        }, 0)

        const sumMaterial = (selectedItems) => selectedItems.reduce((acc, it) => {
          if (it.isMeasuredAfterWork === true) return acc
          if (!it.hasMaterial) return acc
          const mat = parseFloat(it.materialPrice) || 0
          return acc + (it.isFlat ? mat : mat * (parseFloat(it.qty) || 0))
        }, 0)

        const baseItems = items.filter((it) => it.isOptional !== true && it.isMeasuredAfterWork !== true)
        const optionItems = items.filter((it) => it.isOptional === true && it.isMeasuredAfterWork !== true)
        const baseLaborNet = sumLabor(baseItems)
        const baseMatNet = sumMaterial(baseItems)
        const baseNet = baseLaborNet + baseMatNet
        const optionsLaborNet = sumLabor(optionItems)
        const optionsMatNet = sumMaterial(optionItems)
        const optionsNet = optionsLaborNet + optionsMatNet
        const vatRate  = client.vatRate != null && client.vatRate !== '' ? parseFloat(client.vatRate) : 23
        const baseVat = (baseNet * vatRate) / 100
        const baseGross = baseNet + baseVat
        const optionsVat = (optionsNet * vatRate) / 100
        const optionsGross = optionsNet + optionsVat
        const net = baseNet + (includeOptionsInTotal ? optionsNet : 0)
        const laborNet = baseLaborNet + (includeOptionsInTotal ? optionsLaborNet : 0)
        const matNet = baseMatNet + (includeOptionsInTotal ? optionsMatNet : 0)
        const vat = (net * vatRate) / 100
        const gross = net + vat
        const doZaplaty = Math.max(0, gross - (parseFloat(zaliczka) || 0))
        return {
          net, laborNet, matNet, vat, vatRate, gross,
          baseNet, baseLaborNet, baseMatNet, baseVat, baseGross,
          optionsNet, optionsLaborNet, optionsMatNet, optionsVat, optionsGross,
          combinedGross: baseGross + optionsGross,
          zaliczka: parseFloat(zaliczka) || 0, doZaplaty,
        }
      },

      // ─── Historia wycen ───────────────────────────────────────────
      savedQuotes: [],

      saveQuote: (folderOverride) => {
        const { quoteItems, activeSectionId, client, notes, zaliczka, hidePrices, hideTotals, showSectionTotals, hideFooter, includeOptionsInTotal, summaryMode, pdfFontSize, documentType, getCalc } = get()
        const calc  = getCalc()
        const now   = dayjs()
        const folder = folderOverride || now.format('YYYY/MM')
        const id    = Date.now()
        set((s) => ({
          savedQuotes: [
            {
              id,
              savedAt:    now.toISOString(),
              folder,
              quoteNum:   client.quoteNum || '',
              clientName: client.name     || '(bez nazwy)',
              gross:      calc.gross,
              snapshot:   { quoteItems, activeSectionId, client, notes, zaliczka, hidePrices, hideTotals, showSectionTotals, hideFooter, includeOptionsInTotal, summaryMode, pdfFontSize, documentType },
            },
            ...s.savedQuotes,
          ],
        }))
        return id
      },

      loadQuote: (id) => {
        const { savedQuotes } = get()
        const q = savedQuotes.find((q) => q.id === id)
        if (!q) return
        const { quoteItems, activeSectionId, client, notes, zaliczka, hidePrices, hideTotals, showSectionTotals, hideFooter, includeOptionsInTotal, summaryMode, pdfFontSize, documentType } = q.snapshot
        set({
          quoteItems: (quoteItems || []).map((item) => item.type === 'section' ? item : { ...item, isOptional: item.isOptional === true }),
          activeSectionId: activeSectionId || null,
          client,
          notes,
          zaliczka,
          hidePrices,
          hideTotals: hideTotals || false,
          showSectionTotals: showSectionTotals !== false,
          hideFooter: hideFooter ?? true,
          includeOptionsInTotal: includeOptionsInTotal === true,
          summaryMode: summaryMode ?? 'netto',
          pdfFontSize: pdfFontSize || 'normal',
          documentType: documentType || 'Wycena',
        })
      },

      moveQuote: (id, folder) => {
        if (!folder.trim()) return
        set((s) => ({
          savedQuotes: s.savedQuotes.map((q) =>
            q.id === id ? { ...q, folder: folder.trim() } : q
          ),
        }))
      },

      deleteQuote: (id) => {
        if (!window.confirm('Usunąć tę wycenę z historii?')) return
        set((s) => ({ savedQuotes: s.savedQuotes.filter((q) => q.id !== id) }))
      },
    }),
    {
      name: 'bezpieczny-dach-store-v5',
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1) return {}
        return persistedState
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        services: persistedState?.services?.length
          ? persistedState.services
          : currentState.services,
      }),
    }
  )
)