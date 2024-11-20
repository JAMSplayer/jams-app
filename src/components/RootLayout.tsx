import { ReactNode } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import "../index.css";
import { ContentLayout } from "./admin-panel/content-layout";
import { ThemeProvider } from "@/providers/theme-provider";
import { AudioProvider } from "./player/audio-provider";
import "@/i18n/config";
import { LanguageProvider } from "@/providers/language-provider";
import { useEffect, useState } from "react";
import { load, Store } from "@tauri-apps/plugin-store";
import { AgreementModal } from "@/components/AgreementModal";

interface RootLayoutProps {
    children: ReactNode; // Explicitly type children as ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
    const [store, setStore] = useState<Store | null>(null);
    const [hasAgreed, setHasAgreed] = useState<boolean | null>(null);

    // Initialize store
    useEffect(() => {
        const initializeStore = async () => {
            const storeInstance = await load("store.bin", { autoSave: true });
            setStore(storeInstance);

            const agreed = await storeInstance.get<boolean>("userAgreed");
            setHasAgreed(!!agreed);
        };

        initializeStore();
    }, []);

    // Handle user agreement
    const handleAgree = async () => {
        if (!store) return;

        await store.set("userAgreed", true);
        await store.save();
        setHasAgreed(true);
    };

    if (hasAgreed === null) {
        return;
    }

    return (
        <div className={`antialiased flex flex-col min-h-screen`}>
            {hasAgreed ? (
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <AudioProvider>
                            <AdminPanelLayout>
                                <ContentLayout>
                                    <main className="flex-grow">
                                        {children}
                                    </main>
                                </ContentLayout>
                            </AdminPanelLayout>
                        </AudioProvider>
                    </LanguageProvider>
                </ThemeProvider>
            ) : (
                <AgreementModal onAgree={handleAgree} />
            )}
        </div>
    );
};

export default RootLayout;
