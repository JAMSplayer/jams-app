import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditPlaylistIdStore {
    editPlaylistId: string | null; // Store the edit playlist ID
    setEditPlaylistId: (id: string) => void; // Action to set the edit playlist ID
    clearEditPlaylistId: () => void; // Action to clear the edit playlist ID
}

export const useEditPlaylistIdStore = create(
    persist<EditPlaylistIdStore>(
        (set) => ({
            editPlaylistId: null, // Initial state for the edit playlist ID
            setEditPlaylistId: (id: string) => set({ editPlaylistId: id }), // Action to update the ID
            clearEditPlaylistId: () => set({ editPlaylistId: null }), // Action to clear the ID
        }),
        {
            name: "edit-playlist-id", // The key for storing the state in localStorage
        }
    )
);
