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
            sharedStore = storeInstance; // assign to the shared variable
        } catch (error) {
            console.error("Failed to initialize store:", error);
        }
    };

    const setDefaults = async () => {
        try {
            if (!sharedStore) {
                console.error("Store is not initialized.");
                return;
            }

            const storedDownloadFolder = await sharedStore.get<string>(
                "download-folder"
            );

            if (storedDownloadFolder) {
                console.log(
                    "Download folder already set:",
                    storedDownloadFolder
                );
                return;
            }

            // Get the default download folder
            const defaultDownloadFolder = await downloadDir();
            if (!defaultDownloadFolder) {
                console.error("Failed to get default download folder.");
                return;
            }

            console.log(
                "Setting default download folder:",
                defaultDownloadFolder
            );
            await sharedStore.set("download-folder", defaultDownloadFolder);
            await sharedStore.save();
            console.log("Default download folder set successfully");
        } catch (error) {
            console.error("Failed to set default download folder:", error);
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
