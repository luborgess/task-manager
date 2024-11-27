import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LaundryReservation {
  userId: string
  date: string
  slot: 'morning' | 'evening'
}

interface LaundryStore {
  reservations: LaundryReservation[]
  addReservation: (reservation: LaundryReservation) => void
  removeReservation: (date: string, slot: 'morning' | 'evening') => void
  getReservations: () => LaundryReservation[]
}

export const useLaundryStore = create<LaundryStore>()(
  persist(
    (set, get) => ({
      reservations: [
        { userId: 'lucas', date: new Date().toISOString().split('T')[0], slot: 'morning' },
        { userId: 'luiz', date: '2024-01-25', slot: 'evening' },
        { userId: 'kelvin', date: '2024-01-26', slot: 'morning' }
      ],
      
      addReservation: (reservation) => {
        set((state) => ({
          reservations: [...state.reservations, reservation]
        }))
      },
      
      removeReservation: (date, slot) => {
        set((state) => ({
          reservations: state.reservations.filter(
            (r) => !(r.date === date && r.slot === slot)
          )
        }))
      },
      
      getReservations: () => {
        return get().reservations
      }
    }),
    {
      name: 'laundry-storage'
    }
  )
)
