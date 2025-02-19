import { useState, useEffect } from "react";
import { Song } from "@/types/songs/song";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useTranslation } from "react-i18next";
import SongScroller from "./songs/songs-scroller";
import { useStorage } from "@/providers/storage-provider";
import { Playlist } from "@/types/playlists/playlist";

const FavoritesPanel = () => {
    const { t } = useTranslation();
    const [filterValue, setFilterValue] = useState(""); // Filter/search text
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const { store } = useStorage();

    // This will be filled from the fetchedFavoriteSongs below
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
        const fetchFavoriteSongs = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            try {
                // get all playlists from the store
                const playlists: Playlist[] =
                    (await store.get("playlists")) || [];
                const favoriteIds: string[] =
                    (await store.get("favorites")) || [];

                if (!playlists || !favoriteIds.length) {
                    setSongs([]); // No playlists or favorites, set empty list
                    return;
                }

                // filter songs that match the favorite IDs
                const fetchedSongs: Song[] = playlists
                    .flatMap((playlist) => playlist.songs || []) // combine all songs from all playlists
                    .filter((song) => favoriteIds.includes(song.id)); // filter by favorite IDs

                setSongs(fetchedSongs);
            } catch (error) {
                console.error("Failed to fetch favorite songs:", error);
            }
        };

        fetchFavoriteSongs();
    }, []);

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="w-full sticky top-[3.5rem] bg-background z-30 border-b border-t border-secondary p-4 border-l">
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
            <div className="relative z-0">
                <SongScroller
                    songs={songs}
                    filterValue={filterValue}
                    sortOrder={sortOrder}
                    variant={"favorites"}
                />
            </div>
        </div>
    );
};

export default FavoritesPanel;
