import React, { createContext, useEffect, useState, ReactNode } from "react";
import i18next from "i18next";
import { load, Store } from "@tauri-apps/plugin-store";

// Define the shape of your context state
interface LanguageContextProps {
    language: string;
    setLanguage: (lang: string) => void;
}

// Create the LanguageContext
const LanguageContext = createContext<LanguageContextProps | undefined>(
    undefined
);

// LanguageProvider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<string>("en");
    const [store, setStore] = useState<Store | null>(null);

    // Initialize the store when the component mounts
    useEffect(() => {
        const initializeStore = async () => {
            try {
                const storeInstance = await load("store.bin", {
                    autoSave: true,
                });
                setStore(storeInstance); // Set the store instance
            } catch (error) {
                console.error("Failed to initialize store:", error);
            }
        };

        initializeStore();
    }, []);

    // Load the language from storage when the store is ready
    useEffect(() => {
        async function loadLanguage() {
            if (!store) return;

            try {
                const savedLanguage = await store.get<{ value: string }>(
                    "language"
                );
                const defaultLanguage = savedLanguage?.value || "en";
                setLanguage(defaultLanguage);
                i18next.changeLanguage(defaultLanguage);
            } catch (err) {
                console.error("Failed to load language", err);
            }
        }

        loadLanguage();
    }, [store]);

    // Function to change the language and save it in the store
    const changeLanguage = async (lang: string) => {
        setLanguage(lang);
        i18next.changeLanguage(lang);

        if (store) {
            try {
                await store.set("language", { value: lang });
                await store.save();
            } catch (error) {
                console.error("Failed to save language", error);
            }
        }
    };

    // Provide the current language and changeLanguage function to children
    return (
        <LanguageContext.Provider
            value={{ language, setLanguage: changeLanguage }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook for using the LanguageContext
export const useLanguage = () => {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
