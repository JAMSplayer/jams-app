import React, { createContext, useState, useEffect, useContext } from "react";
import { load, Store } from "@tauri-apps/plugin-store";

// Create a context for the store
const StorageContext = createContext<{ store: Store | null }>({ store: null });

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [store, setStore] = useState<Store | null>(null);

    // Initialize the store
    useEffect(() => {
        const initializeStore = async () => {
            try {
                const storeInstance = await load("store.bin", {
                    autoSave: true,
                });
                setStore(storeInstance);
            } catch (error) {
                console.error("Failed to initialize store:", error);
            }
        };

        initializeStore();
    }, []);

    return (
        store && (
            <StorageContext.Provider value={{ store }}>
                {children}
            </StorageContext.Provider>
        )
    );
};

// Custom hook to access the storage context
export const useStorage = () => useContext(StorageContext);
