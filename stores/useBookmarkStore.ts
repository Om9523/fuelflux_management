import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Station } from '@/data/stations';

interface BookmarkState {
  bookmarkedStations: Station[];
  addBookmark: (station: Station) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedStations: [],
      addBookmark: (station) => set((state) => {
        if (!state.bookmarkedStations.find(s => s.id === station.id)) {
          return { bookmarkedStations: [...state.bookmarkedStations, station] };
        }
        return state;
      }),
      removeBookmark: (id) => set((state) => ({
        bookmarkedStations: state.bookmarkedStations.filter(s => s.id !== id)
      })),
      isBookmarked: (id) => !!get().bookmarkedStations.find(s => s.id === id),
    }),
    {
      name: 'bookmark-storage',
    }
  )
);
