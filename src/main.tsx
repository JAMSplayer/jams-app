import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootLayout from "./components/root-layout";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import { StorageProvider } from "./providers/storage-provider";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <StorageProvider>
                <RootLayout>
                    <main>
                        <AppRoutes />
                    </main>
                    <Toaster />
                </RootLayout>
            </StorageProvider>
        </BrowserRouter>
    </StrictMode>
);
