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
import Songs from "./pages/songs";
import UploadSongs from "./pages/upload-songs";
import Playlists from "./pages/playlists";
import CreatePlaylist from "./pages/create-playlist";
import EditPlaylist from "./pages/edit-playlist";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/upload-songs" element={<UploadSongs />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/create-playlist" element={<CreatePlaylist />} />
            <Route path="/edit-playlist" element={<EditPlaylist />} />
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
