import { useState, useEffect } from "react";
import SongScroller from "./songs-scroller";
import { Song } from "@/types/songs/song";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Playlist } from "@/types/playlists/playlist";
import { useAudioPlayer } from "../player/audio-provider";
import { usePlayerStore } from "@/store/player-store";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/providers/storage-provider";

interface SongsPanelProps {
    playlist?: Playlist;
}

const SongsPanel = ({ playlist }: SongsPanelProps) => {
    const { t } = useTranslation();
    const { store } = useStorage();
    const [filterValue, setFilterValue] = useState(""); // Filter/search text
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const { setPlayerVisibility, setHasLoaded } = usePlayerStore();
    const player = useAudioPlayer();

    const handlePlaySong = (song: Song) => {
        setPlayerVisibility(true);
        setHasLoaded(true);
        player.play(song);
    };

    // This will be filled from the fetchedSongs below
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
        refreshSongs();
    }, [playlist, store]); // trigger effect when playlist or store changes

    const refreshSongs = async () => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            const storedPlaylists = await store.get("playlists");

            if (!storedPlaylists || !Array.isArray(storedPlaylists)) {
                console.error("Playlists not found or invalid format.");
                return;
            }
            if (
                playlist &&
                Array.isArray(playlist.songs) &&
                playlist.songs.length > 0
            ) {
                setSongs(playlist.songs);
                handlePlaySong(playlist.songs[0]);
            } else {
                const allSongs: Song[] = storedPlaylists.flatMap(
                    (playlist: Playlist) => playlist.songs || []
                );

                const uniqueSongsMap = new Map<string, Song>();
                allSongs.forEach((song) => {
                    if (song?.id) uniqueSongsMap.set(song.id, song);
                });

                setSongs(Array.from(uniqueSongsMap.values()));
            }
        } catch (error) {
            console.error("Failed to fetch songs from playlists:", error);
        }
    };

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="w-full sticky top-[3.5rem] bg-background z-10 border-b border-t border-secondary p-4 border-l">
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Search"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="border px-2 py-1 w-full md:w-1/3"
                    />
                    <Select
                        value={sortOrder}
                        onValueChange={(value) =>
                            setSortOrder(value as "asc" | "desc")
                        }
                    >
                        <SelectTrigger className="border px-2 py-1 w-full md:w-1/4">
                            <SelectValue placeholder="Select Sort Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">
                                {t("ascending")}
                            </SelectItem>
                            <SelectItem value="desc">
                                {t("descending")}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Song Scroller */}
            <div className="relative">
                <SongScroller
                    songs={songs}
                    filterValue={filterValue}
                    sortOrder={sortOrder}
                    variant="default"
                    onSongDeleted={refreshSongs}
                />
            </div>
        </div>
    );
};

export default SongsPanel;
