import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Playlist } from "@/types/playlists/playlist";
import PlaylistScroller from "./playlists-scroller";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/providers/storage-provider";

export default function PlaylistsPanel() {
    const { t } = useTranslation();

    const [filterValue, setFilterValue] = useState(""); // Filter/search text
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const { store } = useStorage();
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

                // Convert date strings to Date objects
                const playlistsWithDates = storedPlaylists.map((playlist) => ({
                    ...playlist,
                    createdAt: new Date(playlist.createdAt),
                    updatedAt: new Date(playlist.updatedAt),
                }));

                setPlaylists(playlistsWithDates);
            } catch (error) {
                console.error("Failed to load playlists:", error);
            }
        };

        loadPlaylists();
    }, [store]); // Dependency ensures this runs only when the store is ready

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="w-full sticky top-[3.5rem] bg-background z-50 border-b border-t border-secondary p-4 border-l">
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder={t("search")}
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

            {/* Playlist Scroller */}
            <PlaylistScroller
                playlists={playlists}
                filterValue={filterValue}
                sortOrder={sortOrder}
            />
        </div>
    );
}
