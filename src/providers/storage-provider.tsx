import React, { createContext, useState, useEffect, useContext } from "react";
import { load, Store } from "@tauri-apps/plugin-store";
import { downloadDir } from "@tauri-apps/api/path";

// Create a context for the store
const StorageContext = createContext<{ store: Store | null }>({ store: null });

let sharedStore: Store | null = null; // Shared store for non-React usage

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [store, setStore] = useState<Store | null>(null);

    const initializeStore = async () => {
        try {
            const storeInstance = await load("store.bin", {
                autoSave: true,
            });
            setStore(storeInstance);
            sharedStore = storeInstance; // Assign to the shared variable
        } catch (error) {
            console.error("Failed to initialize store:", error);
        }
    };

    const setDefaults = async () => {
        try {
            const activeStore = sharedStore;
            if (!activeStore) {
                console.error("Store is not initialized.");
                return;
            }

            const downloadFolder = await activeStore.get<{ value: string }>(
                "download-folder"
            );

            if (downloadFolder && downloadFolder.value) {
                return;
            }

            // if not set, use the default download directory
            const defaultDownloadFolder = await downloadDir();
            await activeStore.set("download-folder", defaultDownloadFolder);
            await activeStore.save();
        } catch (error) {
            console.error(
                "Failed to set default download folder in store:",
                error
            );
        }
    };

    // Initialize the store
    useEffect(() => {
        const setupStore = async () => {
            await initializeStore();
            await setDefaults();
        };

        setupStore();
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

// Export the shared store for non-React use
export const getExternalStore = (): Promise<Store> => {
    return new Promise((resolve, reject) => {
        if (sharedStore) {
            resolve(sharedStore);
        } else {
            // Wait for the store to initialize
            const checkInterval = setInterval(() => {
                if (sharedStore) {
                    clearInterval(checkInterval);
                    resolve(sharedStore);
                }
            }, 50);

            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error("Failed to initialize the store in time."));
            }, 5000); // Timeout after 5 seconds
        }
    });
};
