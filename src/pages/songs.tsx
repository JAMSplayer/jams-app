import SongsPanel from "@/components/songs/songs-panel";
import { useLocation } from "react-router-dom";

export default function Songs() {
    const location = useLocation();
    const { playlist } = location.state || {};

    return (
        <div>
            <SongsPanel playlist={playlist} />
        </div>
    );
}
