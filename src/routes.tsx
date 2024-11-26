// Routes.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard";
// import NotFound from "./components/NotFound"; TODO reimplement
import Settings from "./pages/settings";
import StatusSettings from "./components/settings/status-settings";
import StorageSettings from "./components/settings/storage-settings";
import NotificationSettings from "./components/settings/notification-settings";
import PreferenceSettings from "./components/settings/preference-settings";
import NetworkSettings from "./components/settings/network-settings";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="*" element={<NotFound />} /> */}
            <Route path="/settings/*" element={<Settings />}>
                <Route path="status" element={<StatusSettings />} />
                <Route path="storage" element={<StorageSettings />} />
                <Route
                    path="notifications"
                    element={<NotificationSettings />}
                />
                <Route path="preference" element={<PreferenceSettings />} />
                <Route path="network" element={<NetworkSettings />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
