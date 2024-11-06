import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import AppRoutes from "./routes";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <RootLayout>
                <main>
                    <AppRoutes />
                </main>
                <Toaster />
            </RootLayout>
        </BrowserRouter>
    </StrictMode>
);
