import React, { createContext, useEffect, useState, ReactNode } from "react";
import i18next from "i18next";
import { useStorage } from "./storage-provider";
import useStoreItem from "@/hooks/use-store-item";

interface LanguageContextProps {
    language: string;
    setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
    undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<string>("en");
    const { store } = useStorage();
    const defaultLanguage = useStoreItem<{ value: string }>(store, "language", {
        value: "en",
    });

    useEffect(() => {
        if (defaultLanguage?.value) {
            setLanguage(defaultLanguage.value);
            i18next.changeLanguage(defaultLanguage.value);
        }
    }, [defaultLanguage]);

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
