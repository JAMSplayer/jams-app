import { ReactNode } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import "../index.css";
import { ContentLayout } from "./admin-panel/content-layout";
import { ThemeProvider } from "@/providers/theme-provider";
import { AudioProvider } from "./player/audio-provider";
import "@/i18n/config";
import { LanguageProvider } from "@/providers/language-provider";

interface RootLayoutProps {
    children: ReactNode; // Explicitly type children as ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
    return (
        <div className={`antialiased flex flex-col min-h-screen`}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                disableTransitionOnChange
            >
                <LanguageProvider>
                    <AudioProvider>
                        <AdminPanelLayout>
                            <ContentLayout>
                                <main className="flex-grow">{children}</main>
                            </ContentLayout>
                        </AdminPanelLayout>
                    </AudioProvider>
                </LanguageProvider>
            </ThemeProvider>
        </div>
    );
};

export default RootLayout;
