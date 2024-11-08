import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the store state and actions
interface PlayerStore {
    isPlayerVisible: boolean;
    togglePlayerVisibility: () => void;
    setPlayerVisibility: (visibility: boolean) => void;
}

// Create the Zustand store
export const usePlayerStore = create(
    persist<PlayerStore>(
        (set) => ({
            isPlayerVisible: false, // Default state
            togglePlayerVisibility: () =>
                set((state) => ({ isPlayerVisible: !state.isPlayerVisible })),
            setPlayerVisibility: (visibility) =>
                set({ isPlayerVisible: visibility }),
        }),
        {
            name: "player-visibility", // The key for storing the state in localStorage
        }
    )
);
