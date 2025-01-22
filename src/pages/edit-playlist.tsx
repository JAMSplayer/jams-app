import EditPlaylistPanel from "@/components/playlists/edit-playlist-panel";
import { useEditPlaylistIdStore } from "@/store/edit-playlist-id";

export default function EditPlaylist() {
    const { editPlaylistId } = useEditPlaylistIdStore();

    if (!editPlaylistId) {
        return <div>Error: Playlist ID is missing!</div>;
    }

    return (
        <div>
            <EditPlaylistPanel id={editPlaylistId} />
        </div>
    );
}
