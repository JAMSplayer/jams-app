import { ReactNode } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import "../index.css";
import { ContentLayout } from "./admin-panel/content-layout";
import { ThemeProvider } from "@/providers/theme-provider";

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
                <AdminPanelLayout>
                    <ContentLayout>
                        <main className="flex-grow">{children}</main>
                    </ContentLayout>
                </AdminPanelLayout>
            </ThemeProvider>
        </div>
    );
};

export default RootLayout;
