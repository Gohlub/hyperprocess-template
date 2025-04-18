import { create } from 'zustand'
import { HyperprocessState } from '../types/Hyperprocess' // Updated import
import { persist, createJSONStorage } from 'zustand/middleware'

export interface HyperprocessStore extends HyperprocessState {
  setStateItems: (items: string[]) => void;
  get: () => HyperprocessStore;
  set: (partial: HyperprocessStore | Partial<HyperprocessStore>) => void;
}

const useHyperprocessStore = create<HyperprocessStore>()( // Renamed store hook
  persist(
    (set, get) => ({
      items: [], // Initialize state with an empty array
      setStateItems: (newItems: string[]) => {
        set({ items: newItems });
      },
      get,
      set,
    }),
    {
      name: 'hyperprocess', // Changed persistence key
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
)

export default useHyperprocessStore; // Export renamed hook 