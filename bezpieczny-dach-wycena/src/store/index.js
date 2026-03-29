import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SERVICES } from '../data/services'
import dayjs from 'dayjs'

// Usunięto _nextId — ID liczone dynamicznie z max istniejących,
// żeby uniknąć kolizji po przeładowaniu strony

const freshQuoteNum = () => {
  const d = dayjs()
  return `WYC/${d.format('MM')}/${d.format('YYYY')}/001`
}

export const useStore = create(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,

      addService: (svc) =>
        set((s) => {
          const maxId = s.services.reduce((m, sv) => Math.max(m, sv.id), 0)
          return { services: [...s.services, { ...svc, id: maxId + 1 }] }
        }),

      updateService: (id, data) =>
        set((s) => ({
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...data } : sv)),
        })),

      deleteService: (id) =>
        set((s) => ({
          services: s.services.filter((sv) => sv.id !== id),
          quoteItems: s.quoteItems.filter((i) => i.sid !== id),
        })),

      quoteItems: [],
      client: {
        name: '', address: '', phone: '', email: '', area: '',
        quoteNum: freshQuoteNum(), validDays: 30, vatRate: 23,
      },
      notes: '',
      discount: 0,
      hidePrices: false,

      setClient: (field, val) =>
        set((s) => ({ client: { ...s.client, [field]: val } })),
      setNotes: (val) => set({ notes: val }),
      setDiscount: (val) => set({ discount: parseFloat(val) || 0 }),
      setHidePrices: (val) => set({ hidePrices: val }),

      addToQuote: (serviceId) => {
        const { services, quoteItems } = get()
        if (quoteItems.find((i) => i.sid === serviceId)) return
        const svc = services.find((s) => s.id === serviceId)
        if (!svc) return
        set({
          quoteItems: [
            ...quoteItems,
            {
              sid: serviceId, name: svc.name, unit: svc.unit,
              qty: 1, price: svc.price,
              hasMaterial: false, materialPrice: 0,
              isFlat: false,
            },
          ],
        })
      },

      removeFromQuote: (idx) =>
        set((s) => ({ quoteItems: s.quoteItems.filter((_, i) => i !== idx) })),

      updateQuoteItem: (idx, field, val) =>
        set((s) => ({
          quoteItems: s.quoteItems.map((it, i) => {
            if (i !== idx) return it
            if (field === 'hasMaterial' || field === 'isFlat') return { ...it, [field]: val }
            return { ...it, [field]: parseFloat(val) || 0 }
          }),
        })),

      clearQuote: () =>
        set({
          quoteItems: [], notes: '', discount: 0, hidePrices: false,
          client: {
            name: '', address: '', phone: '', email: '', area: '',
            quoteNum: freshQuoteNum(), validDays: 30, vatRate: 23,
          },
        }),

      getCalc: () => {
        const { quoteItems, client, discount } = get()
        const net = quoteItems.reduce((acc, it) => {
          const labor = parseFloat(it.price) || 0
          const mat   = it.hasMaterial ? (parseFloat(it.materialPrice) || 0) : 0
          return acc + (it.isFlat ? labor + mat : (labor + mat) * (parseFloat(it.qty) || 0))
        }, 0)
        const discountAmt      = (net * discount) / 100
        const netAfterDiscount = net - discountAmt
        // Fix: || 23 traktuje 0 jako falsy — używamy jawnego sprawdzenia
        const vatRate          = client.vatRate != null && client.vatRate !== '' ? parseFloat(client.vatRate) : 23
        const vat              = (netAfterDiscount * vatRate) / 100
        const gross            = netAfterDiscount + vat
        return { net, discountAmt, netAfterDiscount, vat, vatRate, gross }
      },
    }),
    { name: 'bezpieczny-dach-store-v4' }
  )
)