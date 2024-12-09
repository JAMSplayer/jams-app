import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootLayout from "./components/root-layout";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import { StorageProvider } from "./providers/storage-provider";
import { ConnectionProvider } from "./providers/connection-provider";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ConnectionProvider>
                <StorageProvider>
                    <RootLayout>
                        <main>
                            <AppRoutes />
                        </main>
                        <Toaster />
                    </RootLayout>
                </StorageProvider>
            </ConnectionProvider>
        </BrowserRouter>
    </StrictMode>
);
