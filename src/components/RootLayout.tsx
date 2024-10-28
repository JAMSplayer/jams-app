import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import "../index.css";
import { ContentLayout } from "./admin-panel/content-layout";

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
                    <ContentLayout title="Dashboard">
                        <main className="flex-grow px-6 py-4">{children}</main>
                    </ContentLayout>
                </AdminPanelLayout>
            </ThemeProvider>
        </div>
    );
};

export default RootLayout;
