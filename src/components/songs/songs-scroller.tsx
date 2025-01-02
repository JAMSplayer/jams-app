import { useEffect, useMemo, useState } from "react";
import { PlayIcon } from "lucide-react";
import { Song } from "@/types/songs/song";
import { useAudioPlayer } from "../player/audio-provider";
import { usePlayerStore } from "@/store/player-store";
import { Playlist } from "@/types/playlists/playlist";
import { useStorage } from "@/providers/storage-provider";

interface SongScrollerProps {
    songs: Song[];
    filterValue: string;
    sortOrder: "asc" | "desc";
}

const SongScroller = ({ songs, filterValue, sortOrder }: SongScrollerProps) => {
    const { store } = useStorage();
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

    // Find the playlist title for a song
    const findPlaylistBySongId = (songId: string): string | undefined => {
        const playlist = playlists.find(
            (playlist) =>
                // Ensure playlist.songs is defined before calling .some() on it
                playlist.songs &&
                playlist.songs.some((song) => song.id === songId)
        );
        return playlist ? playlist.title : undefined;
    };

    return (
        <div className="p-4 flex flex-col md:flex-row">
            <div className="flex-grow md:w-2/3 space-y-4 pb-16 overflow-y-auto">
                {filteredAndSortedSongs.length > 0 ? (
                    filteredAndSortedSongs.map((song) => (
                        <div
                            key={song.id}
                            className="relative flex items-stretch bg-background hover:bg-secondary rounded-lg shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden"
                            onClick={() => handlePlaySong(song)}
                        >
                            {/* Album art */}
                            <div className="relative flex-shrink-0 w-20 md:w-24 max-h-20 bg-background rounded-l-lg overflow-hidden">
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

                            {/* Song details  */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1 p-4 flex flex-col justify-center">
                                    <h2 className="text-foreground font-semibold text-lg truncate">
                                        {song.title}
                                    </h2>
                                    <p className="text-foreground text-sm truncate">
                                        {song.artist}
                                    </p>
                                </div>
                                <div className="col-span-2 p-4 flex flex-col justify-center">
                                    <h2 className="text-foreground font-semibold truncate">
                                        <p>
                                            <small>
                                                Playlist:{" "}
                                                {findPlaylistBySongId(
                                                    song.id
                                                ) ?? "Not found"}
                                            </small>
                                        </p>
                                        <p>
                                            <small>
                                                Description: {song.description}
                                            </small>
                                        </p>
                                    </h2>
                                </div>
                                <div className="col-span-1 p-4 flex flex-col justify-center">
                                    <div className="text-foreground text-xs">
                                        <h2 className="text-foreground text-lg truncate">
                                            <p>
                                                <small>
                                                    Date Created:{" "}
                                                    {new Date(
                                                        song.dateCreated
                                                    ).toLocaleDateString()}
                                                </small>
                                            </p>

                                            {song.dateUpdated && (
                                                <p>
                                                    <small>
                                                        Date Updated:{" "}
                                                        {new Date(
                                                            song.dateUpdated
                                                        ).toLocaleDateString()}
                                                    </small>
                                                </p>
                                            )}
                                        </h2>
                                    </div>
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
