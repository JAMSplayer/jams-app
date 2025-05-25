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

const SongsPanel = ({ playlist: initialPlaylist }: SongsPanelProps) => {
    const { t } = useTranslation();
    const { store } = useStorage();
    const [filterValue, setFilterValue] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const { setPlayerVisibility, setHasLoaded } = usePlayerStore();
    const player = useAudioPlayer();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [playlist, setPlaylist] = useState<Playlist | undefined>(
        initialPlaylist
    );
    const [songs, setSongs] = useState<Song[]>([]);

    const handlePlaySong = (song: Song) => {
        setPlayerVisibility(true);
        setHasLoaded(true);
        player.play(song);
    };

    const refreshSongs = async () => {
        if (!store) return;

        try {
            const storedPlaylists = (await store.get(
                "playlists"
            )) as Playlist[];
            if (!storedPlaylists || !Array.isArray(storedPlaylists)) {
                console.error("Playlists not found or invalid format.");
                return;
            }

            setPlaylists(storedPlaylists);

            if (playlist?.id) {
                const updatedPlaylist = storedPlaylists.find(
                    (p) => p.id === playlist.id
                );
                setPlaylist(updatedPlaylist);

                if (updatedPlaylist?.songs?.length) {
                    setSongs(updatedPlaylist.songs);
                    handlePlaySong(updatedPlaylist.songs[0]);
                    return;
                }
            }

            const allSongs: Song[] = storedPlaylists.flatMap(
                (p) => p.songs || []
            );
            const uniqueSongsMap = new Map<string, Song>();
            allSongs.forEach((song) => {
                if (song?.id) uniqueSongsMap.set(song.id, song);
            });

            setSongs(Array.from(uniqueSongsMap.values()));
        } catch (error) {
            console.error("Failed to fetch songs from playlists:", error);
        }
    };

    useEffect(() => {
        refreshSongs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlist?.id]);

    return (
        <div className="w-full">
            <div className="w-full sticky top-[3.5rem] bg-background z-10 border-b border-t border-secondary p-4 border-l">
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder={t("search") || "Search"}
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
                            <SelectValue placeholder={t("select_sort_order")} />
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

            <div className="relative">
                <SongScroller
                    songs={songs}
                    playlists={playlists}
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
