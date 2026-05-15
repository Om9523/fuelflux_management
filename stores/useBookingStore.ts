import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  fuelType: string;
  quantity: number;
  amount: number;
  vehicleNumber: string;
  date: string;
  slot: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  qrCodeData: string;
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  getActiveBookings: () => Booking[];
  getBookingHistory: () => Booking[];
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
      updateBookingStatus: (id, status) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
      })),
      getActiveBookings: () => get().bookings.filter(b => ['Pending', 'Confirmed'].includes(b.status)),
      getBookingHistory: () => get().bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status)),
    }),
    {
      name: 'booking-storage',
    }
  )
);
