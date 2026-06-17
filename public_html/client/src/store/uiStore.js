import { create } from 'zustand'

const useUIStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now() + Math.random(), ...toast },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  badgeUnlock: null,
  setBadgeUnlock: (badge) => set({ badgeUnlock: badge }),
  clearBadgeUnlock: () => set({ badgeUnlock: null }),
}))

export default useUIStore
