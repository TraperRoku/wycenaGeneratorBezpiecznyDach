import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SERVICES } from '../data/services'
import dayjs from 'dayjs'

let _nextId = 500

const freshQuoteNum = () => {
  const d = dayjs()
  return `WYC/${d.format('MM')}/${d.format('YYYY')}/001`
}

export const useStore = create(
  persist(
    (set, get) => ({
      /* ─── Katalog usług ─── */
      services: DEFAULT_SERVICES,

      addService: (svc) =>
        set((s) => ({ services: [...s.services, { ...svc, id: _nextId++ }] })),

      updateService: (id, data) =>
        set((s) => ({
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...data } : sv)),
        })),

      deleteService: (id) =>
        set((s) => ({
          services: s.services.filter((sv) => sv.id !== id),
          quoteItems: s.quoteItems.filter((i) => i.sid !== id),
        })),

      /* ─── Wycena ─── */
      quoteItems: [],
      client: {
        name: '',
        address: '',
        phone: '',
        email: '',
        area: '',
        quoteNum: freshQuoteNum(),
        validDays: 30,
        vatRate: 23,
      },
      notes: '',
      discount: 0,

      setClient: (field, val) =>
        set((s) => ({ client: { ...s.client, [field]: val } })),

      setNotes: (val) => set({ notes: val }),

      setDiscount: (val) => set({ discount: parseFloat(val) || 0 }),

      addToQuote: (serviceId) => {
        const { services, quoteItems } = get()
        if (quoteItems.find((i) => i.sid === serviceId)) return
        const svc = services.find((s) => s.id === serviceId)
        if (!svc) return
        set({
          quoteItems: [
            ...quoteItems,
            { sid: serviceId, name: svc.name, unit: svc.unit, qty: 1, price: svc.price },
          ],
        })
      },

      removeFromQuote: (idx) =>
        set((s) => ({ quoteItems: s.quoteItems.filter((_, i) => i !== idx) })),

      updateQuoteItem: (idx, field, val) =>
        set((s) => ({
          quoteItems: s.quoteItems.map((it, i) =>
            i === idx ? { ...it, [field]: parseFloat(val) || 0 } : it
          ),
        })),

      clearQuote: () =>
        set({
          quoteItems: [],
          notes: '',
          discount: 0,
          client: {
            name: '',
            address: '',
            phone: '',
            email: '',
            area: '',
            quoteNum: freshQuoteNum(),
            validDays: 30,
            vatRate: 23,
          },
        }),

      /* ─── Wyliczenia ─── */
      getCalc: () => {
        const { quoteItems, client, discount } = get()
        const net = quoteItems.reduce((acc, it) => acc + it.qty * it.price, 0)
        const discountAmt = (net * discount) / 100
        const netAfterDiscount = net - discountAmt
        const vatRate = parseFloat(client.vatRate) || 23
        const vat = (netAfterDiscount * vatRate) / 100
        const gross = netAfterDiscount + vat
        return { net, discountAmt, netAfterDiscount, vat, vatRate, gross }
      },
    }),
    {
      name: 'bezpieczny-dach-store-v1',
    }
  )
)
