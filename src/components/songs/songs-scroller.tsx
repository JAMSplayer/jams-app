import { useEffect, useMemo, useState } from "react";
import { EditIcon, HeartIcon, PlayIcon, XIcon } from "lucide-react";
import { Song } from "@/types/songs/song";
import { useAudioPlayer } from "../player/audio-provider";
import { usePlayerStore } from "@/store/player-store";
import { Playlist } from "@/types/playlists/playlist";
import { useStorage } from "@/providers/storage-provider";
import { AlertConfirmationModal } from "../alert-confirmation-modal";
import { toast } from "sonner";
//import { useNavigate } from "react-router-dom";

interface SongScrollerProps {
    songs: Song[];
    filterValue: string;
    sortOrder: "asc" | "desc";
}

const SongScroller = ({ songs, filterValue, sortOrder }: SongScrollerProps) => {
    const { store } = useStorage();
//    const navigate = useNavigate();
    const { setPlayerVisibility, setHasLoaded } = usePlayerStore();
    const player = useAudioPlayer();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        const loadPlaylists = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            try {
                const storedPlaylists: Playlist[] =
                    (await store.get("playlists")) || [];
                setPlaylists(storedPlaylists); // Store playlists in state
            } catch (error) {
                console.error("Failed to fetch playlists:", error);
            }
        };

        loadPlaylists();
    }, []); // This runs only once when the component mounts

    const handlePlaySong = (song: Song) => {
        setPlayerVisibility(true);
        setHasLoaded(true);
        player.play(song);
    };

    const filterSongs = (songs: Song[], filterValue: string): Song[] => {
        const trimmedFilterValue = filterValue.trim().toLowerCase();

        if (!trimmedFilterValue) return songs; // Return all songs if no filter is applied

        // Check for exact matches first
        const exactMatches = songs.filter((song) =>
            [song.title, song.description, song.artist].some(
                (field) => field?.toLowerCase() === trimmedFilterValue // Exact match check
            )
        );

        // If there are exact matches, return only those
        if (exactMatches.length > 0) {
            return exactMatches;
        }

        // If no exact matches, return partial matches
        return songs.filter((song) =>
            [song.title, song.description, song.artist].some(
                (field) => field?.toLowerCase().includes(trimmedFilterValue) // Partial match check
            )
        );
    };

    // Function to sort songs based on the sort order
    const sortSongs = (songs: Song[], sortOrder: "asc" | "desc") => {
        return songs.sort((a, b) => {
            if (sortOrder === "asc") {
                return a.dateCreated.getTime() - b.dateCreated.getTime();
            } else {
                return b.dateCreated.getTime() - a.dateCreated.getTime();
            }
        });
    };

    // Apply filter and sort to the songs
    const filteredAndSortedSongs = useMemo(() => {
        let filteredSongs = filterSongs(songs, filterValue);
        return sortSongs(filteredSongs, sortOrder);
    }, [songs, filterValue, sortOrder]);

    // Find all the playlist titles for a song id
    const findPlaylistsBySongId = (songId: string): string[] => {
        if (!Array.isArray(playlists)) {
            console.error("Playlists data is not in an array format.");
            return [];
        }

        // Filter playlists that contain the song and map their titles
        return playlists
            .filter(
                (playlist) =>
                    playlist.songs &&
                    playlist.songs.some((song) => song.id === songId)
            )
            .map((playlist) => playlist.title);
    };

    // delete confirmation modal ----------------------------------------------------------------

    const [
        isDeleteConfirmationModalVisible,
        setDeleteConfirmationModalVisible,
    ] = useState(false);

    const [selectedSongId, setSelectedSongId] = useState<string | null>(null); // Track the song ID

    const handleDeleteClick = (id: string) => {
        setSelectedSongId(id); // Set the song ID
        setDeleteConfirmationModalVisible(true); // Show the modal
    };

    const handleConfirm = async () => {
        if (!store || !selectedSongId) {
            console.error("Store is not initialized or no song ID provided.");
            return;
        }

        try {
            // Retrieve existing playlists from the store
            const storedPlaylists: Playlist[] =
                (await store.get("playlists")) || [];

            // Ensure playlists is an array
            if (!Array.isArray(storedPlaylists)) {
                console.error(
                    "Playlists are not in the expected array format."
                );
                return;
            }

            // Remove the song with the selected ID from all playlists
            const updatedPlaylists = storedPlaylists.map((playlist) => ({
                ...playlist,
                songs:
                    playlist.songs?.filter(
                        (song) => song.id !== selectedSongId
                    ) || [],
            }));

            // Save the updated playlists back to the store
            await store.set("playlists", updatedPlaylists);
            await store.save();

            toast("Song Deleted", {
                description: "Your song has been deleted from all playlists.",
            });
        } catch (error) {
            console.error("Failed to delete the song:", error);
        }

        setDeleteConfirmationModalVisible(false);
        setSelectedSongId(null); // Reset the selected song ID
    };

    const handleCancel = () => {
        setDeleteConfirmationModalVisible(false);
        setSelectedSongId(null); // Reset the selected song ID
    };

    // end delete confirmation modal ----------------------------------------------------------------

    return (
        <div className="p-4 flex flex-col md:flex-row">
            {isDeleteConfirmationModalVisible && (
                <AlertConfirmationModal
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete this song from all playlists?\n\nYou can manually add it again via the 'Add Song' page.`}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

            <div className="flex-grow md:w-2/3 space-y-4 pb-16 overflow-y-auto">
                {filteredAndSortedSongs.length > 0 ? (
                    filteredAndSortedSongs.map((song) => (
                        <div
                            key={song.id}
                            className="relative flex items-stretch bg-background hover:bg-secondary rounded-lg shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden"
                            onClick={() => handlePlaySong(song)}
                        >
                            {/* Album art */}
                            <div className="relative flex-shrink-0 w-20 md:max-h-20 bg-background rounded-l-lg overflow-hidden">
                                {song.artUrl ? (
                                    <img
                                        src={song.artUrl}
                                        alt="Album Art"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300"></div> // Placeholder
                                )}

                                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none">
                                        <PlayIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                            {/* Song details */}
                            <div className="grid grid-cols-1 md:grid-cols-4 w-full">
                                {/* First column (left-aligned) */}
                                <div className="flex justify-start p-2">
                                    <div className="flex flex-col justify-start">
                                        <h2 className="text-foreground font-semibold text-lg truncate">
                                            {song.title}
                                        </h2>
                                        <p className="text-foreground text-sm truncate">
                                            {song.artist}
                                        </p>
                                    </div>
                                </div>

                                {/* Second column (left-aligned) */}
                                <div className="flex justify-start p-2">
                                    <div className="flex flex-col justify-start">
                                        <h2 className="text-foreground font-semibold truncate">
                                            <p>
                                                <small>
                                                    Playlists:{" "}
                                                    {findPlaylistsBySongId(
                                                        song.id
                                                    ).length > 0
                                                        ? findPlaylistsBySongId(
                                                              song.id
                                                          ).join(", ")
                                                        : "Not found"}
                                                </small>
                                            </p>
                                            <p>
                                                <small>
                                                    Description:{" "}
                                                    {song.description}
                                                </small>
                                            </p>
                                        </h2>
                                    </div>
                                </div>

                                {/* Third column (left-aligned) */}
                                <div className="flex justify-start p-2">
                                    <div className="flex flex-col justify-start">
                                        <h2 className="text-foreground font-semibold truncate">
                                            <p>
                                                {song.tags &&
                                                    song.tags.length > 0 && (
                                                        <small>
                                                            Tags:{" "}
                                                            {song.tags.join(
                                                                ", "
                                                            )}
                                                        </small>
                                                    )}
                                            </p>
                                        </h2>
                                    </div>
                                </div>

                                {/* Fourth column (center-aligned vertically) */}
                                <div className="flex justify-start items-center p-4 hidden md:block">
                                    <div className="flex flex-col">
                                        {/* Buttons */}
                                        <div className="flex space-x-4 pt-2 sm:pt-0">
                                            {/* Favorite button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                            >
                                                <HeartIcon className="w-4 h-4" />
                                            </button>
                                            {/* Edit button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(song.id); // Pass song.id
                                                }}
                                                className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-destructive dark:hover:text-white hover:text-background transition-colors duration-200 focus:outline-none"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:hidden">
                                {/* Buttons */}
                                <div className="flex flex-col space-y-4 p-2">
                                    {/* Favorite button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                    >
                                        <HeartIcon className="w-4 h-4" />
                                    </button>
                                    {/* Edit button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(song.id); // Pass song.id
                                        }}
                                        className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-destructive hover:text-background dark:hover:text-white transition-colors duration-200 focus:outline-none"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No songs found.</p>
                )}
            </div>
        </div>
    );
};

export default SongScroller;
