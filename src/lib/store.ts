import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  language: 'ru' | 'kz';
}

interface UserState {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  language: 'ru' | 'kz';
  setLanguage: (language: 'ru' | 'kz') => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  searchHistory: string[];
  addSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  favorites: {
    products: string[];
    sellers: string[];
  };
  toggleProductFavorite: (productId: string) => void;
  toggleSellerFavorite: (sellerId: string) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      darkMode: false,
      setDarkMode: (darkMode) => set({ darkMode }),
      language: 'ru',
      setLanguage: (language) => set({ language }),
      session: null,
      setSession: (session) => set({ session }),
      searchHistory: [],
      addSearchTerm: (term) => set((state) => ({
        searchHistory: [term, ...state.searchHistory.filter(t => t !== term)].slice(0, 10)
      })),
      clearSearchHistory: () => set({ searchHistory: [] }),
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: 'ru'
      },
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      favorites: {
        products: [],
        sellers: []
      },
      toggleProductFavorite: (productId) => set((state) => ({
        favorites: {
          ...state.favorites,
          products: state.favorites.products.includes(productId)
            ? state.favorites.products.filter(id => id !== productId)
            : [...state.favorites.products, productId]
        }
      })),
      toggleSellerFavorite: (sellerId) => set((state) => ({
        favorites: {
          ...state.favorites,
          sellers: state.favorites.sellers.includes(sellerId)
            ? state.favorites.sellers.filter(id => id !== sellerId)
            : [...state.favorites.sellers, sellerId]
        }
      })),
      recentlyViewed: [],
      addRecentlyViewed: (productId) => set((state) => ({
        recentlyViewed: [productId, ...state.recentlyViewed.filter(id => id !== productId)].slice(0, 20)
      })),
    }),
    {
      name: 'user-preferences',
    }
  )
);

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  useStore.getState().setSession(session);
});