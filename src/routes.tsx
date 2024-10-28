// Routes.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NotFound from "./components/NotFound";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
