import { ReactNode, useEffect, useState } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import "../index.css";
import { ContentLayout } from "./admin-panel/content-layout";
import { ThemeProvider } from "@/providers/theme-provider";
import { AudioProvider } from "./player/audio-provider";
import "@/i18n/config";
import { LanguageProvider } from "@/providers/language-provider";
import { AgreementModal } from "@/components/agreement-modal";
import { useStorage } from "@/providers/storage-provider";


interface RootLayoutProps {
    children: ReactNode; // Explicitly type children as ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
    const { store } = useStorage();
    const [hasAgreed, setHasAgreed] = useState<boolean | null>(null);

    const handleAgree = async () => {
        if (!store) return;
        try {
            await store.set("userAgreed", true);
            await store.save();
            setHasAgreed(true);
        } catch (error) {
            console.error("Failed to save user agreement:", error);
        }
    };

    useEffect(() => {
        const getSetting = async () => {
            if (!store) return;
            try {
                const agreed = await store.get<boolean>("userAgreed");
                setHasAgreed(!!agreed);
            } catch (error) {
                console.error("Failed to load user agreement status:", error);
            }
        };

        getSetting();
    }, [store]);

    return (
        <div className={"antialiased flex flex-col min-h-screen"}>
            {hasAgreed === null ? (
                <></>
            ) : hasAgreed ? (
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
