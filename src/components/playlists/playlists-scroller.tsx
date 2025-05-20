import { useMemo } from "react";
import { EditIcon, FileDownIcon, PlayIcon, XIcon, Trash2 } from "lucide-react";
import { Playlist } from "@/types/playlists/playlist";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEditPlaylistIdStore } from "@/store/edit-playlist-id";
import { useStorage } from "@/providers/storage-provider";
import { writeFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import { Song } from "@/types/songs/song";

interface PlaylistScrollerProps {
    playlists: Playlist[];
    filterValue: string;
    sortOrder: "asc" | "desc";
    onPlaylistsChange?: () => void;
}

const PlaylistScroller = ({
    playlists,
    filterValue,
    sortOrder,
    onPlaylistsChange,
}: PlaylistScrollerProps) => {
    const { t } = useTranslation();
    const { store } = useStorage();

    const navigate = useNavigate();
    const { setEditPlaylistId } = useEditPlaylistIdStore();

    const exportPlaylistData = async (id: string) => {
        if (!store || !id) return;
        const all = await store.get("playlists");
        const storedPlaylists = Array.isArray(all) ? all : [];
        const playlist = storedPlaylists.find((p: Playlist) => p.id === id);
        if (!playlist) return;

        const redactedPlaylist = {
            ...playlist,
            songs: playlist.songs?.map((song: Song) => ({
                ...song,
                downloadFolder: null,
            })),
        };

        const filePath = await save({
            defaultPath: `${playlist.title}.json`,
            filters: [{ name: "JSON", extensions: ["json"] }],
        });
        if (!filePath) return;

        const jsonData = JSON.stringify(redactedPlaylist, null, 2);
        await writeFile(filePath, new TextEncoder().encode(jsonData));

        toast("Playlist Export", {
            description: "Your playlist has been exported",
        });
    };

    const deletePlaylist = async (id: string) => {
        if (!store) return;
        const existing = (await store.get("playlists")) as Playlist[];
        const updated = existing.filter((p) => p.id !== id);
        await store.set("playlists", updated);
        await store.save();
        toast("Playlist Deleted", { description: "Playlist was removed." });
        onPlaylistsChange?.();
    };

    const filteredAndSortedPlaylists = useMemo(() => {
        let filtered = playlists;
        const trimmed = filterValue.trim().toLowerCase();
        if (trimmed) {
            const exact = filtered.filter((p) =>
                [p.title, p.description].some(
                    (f) => f?.toLowerCase() === trimmed
                )
            );
            filtered =
                exact.length > 0
                    ? exact
                    : filtered.filter((p) =>
                          [p.title, p.description].some((f) =>
                              f?.toLowerCase().includes(trimmed)
                          )
                      );
        }
        return filtered.sort((a, b) =>
            sortOrder === "asc"
                ? new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
        );
    }, [playlists, filterValue, sortOrder]);

    return (
        <div className="p-4 pb-20">
            {filteredAndSortedPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAndSortedPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="relative bg-background hover:bg-secondary rounded-lg shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden"
                            onClick={() => {
                                if ((playlist.songs?.length ?? 0) > 0) {
                                    navigate("/songs", { state: { playlist } });
                                }
                            }}
                        >
                            <div className="flex flex-row gap-2 absolute top-2 right-2">
                                <button
                                    className="bg-primary text-background p-2 rounded-full z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditPlaylistId(playlist.id);
                                        navigate(
                                            `/edit-playlist?id=${playlist.id}`
                                        );
                                    }}
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>

                                <button
                                    className="bg-primary text-background p-2 rounded-full z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportPlaylistData(playlist.id);
                                    }}
                                >
                                    <FileDownIcon className="w-4 h-4" />
                                </button>

                                <button
                                    className="bg-destructive text-background p-2 rounded-full z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePlaylist(playlist.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div
                                className={`relative h-40 bg-gray-900 overflow-hidden ${
                                    !playlist.songs?.length ? "opacity-50" : ""
                                }`}
                            >
                                {playlist.picture ? (
                                    <img
                                        src={playlist.picture}
                                        alt="Playlist Art"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black" />
                                )}

                                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                                    <div className="bg-primary text-background p-2 rounded-full">
                                        {(playlist.songs?.length ?? 0) > 0 ? (
                                            <PlayIcon className="w-6 h-6" />
                                        ) : (
                                            <XIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <h2 className="text-foreground font-semibold text-lg truncate">
                                    {playlist.title}
                                </h2>
                                <p className="text-foreground text-sm truncate">
                                    {playlist.description}
                                </p>
                                <div className="text-foreground text-xs mt-1">
                                    <small>
                                        {t("songs")}:{" "}
                                        {playlist.songs?.length ?? 0}
                                    </small>{" "}
                                    -{" "}
                                    <small>
                                        {new Date(
                                            playlist.createdAt
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>{t("noPlaylistsFound")}.</p>
            )}
        </div>
    );
};

export default PlaylistScroller;
