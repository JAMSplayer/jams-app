import { Button } from "@/components/ui/button"; // Use your button component
import { useStorage } from "@/providers/storage-provider";
import { Playlist } from "@/types/playlists/playlist";
import { Song } from "@/types/songs/song";
import { useEffect, useState } from "react";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { toast } from "sonner";

type PlaylistSelectionModalProps = {
    song: Song;
    onConfirm: (playlistId: string) => void;
    onCancel: () => void;
};

export const PlaylistSelectionModal: React.FC<PlaylistSelectionModalProps> = ({
    song,
    onConfirm,
    onCancel,
}) => {
    const { store } = useStorage();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
        null
    );

    // fetch playlists from the store
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            try {
                // fetch and cast to Playlist[]
                const storedPlaylists: Playlist[] =
                    (await store.get("playlists")) || [];
                setPlaylists(storedPlaylists);
                setFilteredPlaylists(storedPlaylists);
            } catch (error) {
                console.error("Failed to fetch playlists:", error);
            }
        };

        fetchPlaylists();
    }, [store]);

    // filter playlists based on the search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredPlaylists(playlists);
        } else {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            setFilteredPlaylists(
                playlists.filter((playlist) =>
                    playlist.title.toLowerCase().includes(lowercasedSearchTerm)
                )
            );
        }
    }, [searchTerm, playlists]);

    // handle playlist selection
    const handlePlaylistSelection = (id: string) => {
        setSelectedPlaylistId(id);
    };

    const handleConfirm = async () => {
        if (selectedPlaylistId && store) {
            try {
                // fetch and cast playlists to the correct type
                const storedPlaylists: Playlist[] =
                    (await store.get("playlists")) || [];

                // find the playlist by ID
                const playlistIndex = storedPlaylists.findIndex(
                    (p: Playlist) => p.id === selectedPlaylistId
                );

                if (playlistIndex > -1) {
                    // Retrieve the playlist
                    const updatedPlaylist = storedPlaylists[playlistIndex];

                    // Ensure the songs array is initialized
                    if (!updatedPlaylist.songs) {
                        updatedPlaylist.songs = [];
                    }

                    // Check if the song already exists in the playlist
                    const songExists = updatedPlaylist.songs.some(
                        (s: Song) => s.id === song.id
                    );

                    if (songExists) {
                        // Show a toast if the song exists
                        toast("Song Already Exists", {
                            description:
                                "A song with this exact metadata already exists in this playlist",
                        });
                    } else {
                        // Add the song if it doesn't exist
                        updatedPlaylist.songs.push(song);

                        // Save the updated playlist back to the store
                        storedPlaylists[playlistIndex] = updatedPlaylist;
                        await store.set("playlists", storedPlaylists);
                        await store.save();

                        // Show a toast for successful addition
                        toast("Song Added", {
                            description: `The song "${song.title}" has been added to the playlist.`,
                        });

                        // Call the onConfirm callback
                        onConfirm(selectedPlaylistId);
                    }
                }
            } catch (error) {
                console.error("Failed to add song to playlist:", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm m-4">
                {/* Title */}
                <h2 className="text-xl font-semibold mb-4">Add to Playlist</h2>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                    Select a playlist to add <strong>{song.title}</strong>
                </p>

                {/* Search Input */}
                <Input
                    type="text"
                    placeholder="Search playlists"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                {/* Playlist List */}
                <ScrollArea className="h-60 border rounded mb-4">
                    {filteredPlaylists.length > 0 ? (
                        filteredPlaylists.map((playlist) => (
                            <div
                                key={playlist.id}
                                onClick={() =>
                                    handlePlaylistSelection(playlist.id)
                                }
                                className={`p-3 border-b cursor-pointer ${
                                    selectedPlaylistId === playlist.id
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <p className="font-medium">{playlist.title}</p>
                                <p className="text-sm text-gray-500">
                                    {playlist.songs?.length ?? 0} song(s)
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 p-3">
                            No playlists found.
                        </p>
                    )}
                </ScrollArea>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedPlaylistId} // Disable if no playlist is selected
                        className={`px-4 py-2 rounded transition ${
                            selectedPlaylistId
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};
