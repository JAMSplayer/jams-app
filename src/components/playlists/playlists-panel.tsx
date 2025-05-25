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
import { Song } from "@/types/songs/song";
import { NetworkFileDetail } from "@/types/network-file-detail";
import { downloadPlaylist } from "@/lib/utils/downloading";
import { LoadingSpinner } from "../ui/loading-spinner";

export default function PlaylistsPanel() {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const [filterValue, setFilterValue] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const { store } = useStorage();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const loadPlaylists = async () => {
        if (!store) return;
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
    }, [store]);

    const importPlaylistData = async () => {
        if (!store) return;

        try {
            const defaultDownloadFolder = await store.get<{ value: string }>(
                "download-folder"
            );
            if (!defaultDownloadFolder?.value) return;

            const filePath = await open({
                filters: [{ name: "JSON", extensions: ["json"] }],
            });
            if (!filePath) return;

            const fileContent = await readFile(filePath);
            const importedPlaylist = JSON.parse(
                new TextDecoder().decode(fileContent)
            );

            if (!importedPlaylist?.id || !importedPlaylist?.title) return;

            if (Array.isArray(importedPlaylist.songs)) {
                importedPlaylist.songs = importedPlaylist.songs.map(
                    (song: Song) => ({
                        ...song,
                        downloadFolder: defaultDownloadFolder.value,
                    })
                );
            }

            const playlists = await store.get("playlists");
            const storedPlaylists = Array.isArray(playlists)
                ? (playlists as Playlist[])
                : [];

            const playlistExists = storedPlaylists.some(
                (p: Playlist) => p.id === importedPlaylist.id
            );

            if (playlistExists) return;

            setIsLoading(true);
            const networkFiles: NetworkFileDetail[] | null =
                await downloadPlaylist(importedPlaylist).finally(() =>
                    setIsLoading(false)
                );
            if (!networkFiles) return;

            storedPlaylists.push(importedPlaylist);
            await store.set("playlists", storedPlaylists);
            await store.save();
            loadPlaylists();

            toast("Playlist Import", {
                description: "Your playlist has been imported and saved.",
            });
        } catch (error) {
            console.error("Failed to import playlist:", error);
        }
    };

    return (
        <div className="w-full">
            {/* filters */}
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
                    <Button disabled={isLoading} onClick={importPlaylistData}>
                        {isLoading ? (
                            <>
                                Downloading... <LoadingSpinner />
                            </>
                        ) : (
                            <>
                                <DownloadIcon size={16} />
                                Import Playlist
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <PlaylistScroller
                playlists={playlists}
                filterValue={filterValue}
                sortOrder={sortOrder}
                onPlaylistsChange={loadPlaylists}
            />
        </div>
    );
}
