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
import { toast } from "sonner";
import { readFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "../ui/button";
import { DownloadIcon } from "lucide-react";

export default function PlaylistsPanel() {
    const { t } = useTranslation();

    const [filterValue, setFilterValue] = useState(""); // Filter/search text
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const { store } = useStorage();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const loadPlaylists = async () => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            const storedPlaylists: Playlist[] =
                (await store.get("playlists")) || [];

            setPlaylists(storedPlaylists);
        } catch (error) {
            console.error("Failed to load playlists:", error);
        }
    };

    useEffect(() => {
        loadPlaylists();
    }, [store]); // Dependency ensures this runs only when the store is ready

    const importPlaylistData = async () => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            // prompt the user to select the playlist file
            const filePath = await open({
                filters: [{ name: "JSON", extensions: ["json"] }],
            });

            if (!filePath) {
                console.log("User canceled file selection.");
                return;
            }

            // read the file contents
            const fileContent = await readFile(filePath);
            const importedPlaylist = JSON.parse(
                new TextDecoder().decode(fileContent)
            );

            // ensure the imported data is a valid playlist
            if (
                !importedPlaylist ||
                !importedPlaylist.id ||
                !importedPlaylist.title
            ) {
                console.error("Invalid playlist data.");
                return;
            }

            // retrieve the current playlists from the store
            const playlists = await store.get("playlists");

            // ensure playlists is an array
            const storedPlaylists = Array.isArray(playlists)
                ? (playlists as Playlist[])
                : [];

            // check if the playlist already exists to avoid duplicates
            const playlistExists = storedPlaylists.some(
                (p: Playlist) => p.id === importedPlaylist.id
            );

            if (playlistExists) {
                console.log("Playlist already exists in the store.");
            } else {
                // append the imported playlist to the stored playlists
                storedPlaylists.push(importedPlaylist);

                // save the updated playlists to the store
                await store.set("playlists", storedPlaylists);
                await store.save();

                // reload the playlists
                loadPlaylists();

                toast("Playlist Import", {
                    description: "Your playlist has been imported and saved.",
                });
            }
        } catch (error) {
            console.error("Failed to import playlist:", error);
        }
    };

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="w-full sticky top-[3.5rem] bg-background z-20 border-b border-t border-secondary p-4 border-l">
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
                    <Button
                        onClick={async () => {
                            await importPlaylistData();
                        }}
                    >
                        <DownloadIcon size={16} />
                        Import Playlist
                    </Button>
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
