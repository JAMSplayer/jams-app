import { useMemo } from "react";
import { EditIcon, FileDownIcon, PlayIcon, XIcon } from "lucide-react";
import { Playlist } from "@/types/playlists/playlist";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEditPlaylistIdStore } from "@/store/edit-playlist-id";
import { useStorage } from "@/providers/storage-provider";
import { writeFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";

interface PlaylistScrollerProps {
    playlists: Playlist[];
    filterValue: string;
    sortOrder: "asc" | "desc";
}

const PlaylistScroller = ({
    playlists,
    filterValue,
    sortOrder,
}: PlaylistScrollerProps) => {
    const { t } = useTranslation();
    const { store } = useStorage();

    const exportPlaylistData = async (id: string) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        if (!id) {
            console.error("Playlist ID is missing.");
            return;
        }

        try {
            const playlists = await store.get("playlists");

            // ensure playlists is an array
            const storedPlaylists = Array.isArray(playlists)
                ? (playlists as Playlist[])
                : [];

            const playlist = storedPlaylists.find((p: Playlist) => p.id === id);

            if (!playlist) {
                console.error("Playlist not found.");
                return;
            }

            // create a copy and remove downloadFolder info from all songs
            const redactedPlaylist: Playlist = {
                ...playlist,
                songs: playlist.songs?.map((song) => ({
                    ...song,
                    downloadFolder: null, // redact by setting it to null
                })),
            };

            const filePath = await save({
                defaultPath: `${playlist.title}.json`,
                filters: [{ name: "JSON", extensions: ["json"] }],
            });

            if (!filePath) {
                console.log("User canceled save dialog.");
                return;
            }

            const jsonData = JSON.stringify(redactedPlaylist, null, 2);
            await writeFile(filePath, new TextEncoder().encode(jsonData));

            toast("Playlist Export", {
                description: "Your playlist has been exported",
            });
        } catch (error) {
            console.error("Failed to load playlist data:", error);
        }
    };

    const filterPlaylists = (
        playlists: Playlist[],
        filterValue: string
    ): Playlist[] => {
        const trimmedFilterValue = filterValue.trim().toLowerCase();

        if (!trimmedFilterValue) return playlists;

        const exactMatches = playlists.filter((playlist) =>
            [playlist.title, playlist.description].some(
                (field) => field?.toLowerCase() === trimmedFilterValue
            )
        );

        if (exactMatches.length > 0) {
            return exactMatches;
        }

        return playlists.filter((playlist) =>
            [playlist.title, playlist.description].some((field) =>
                field?.toLowerCase().includes(trimmedFilterValue)
            )
        );
    };

    const sortPlaylists = (
        playlists: Playlist[],
        sortOrder: "asc" | "desc"
    ) => {
        return playlists.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            if (sortOrder === "asc") {
                return dateA.getTime() - dateB.getTime();
            } else {
                return dateB.getTime() - dateA.getTime();
            }
        });
    };

    const filteredAndSortedPlaylists = useMemo(() => {
        let filteredPlaylists = filterPlaylists(playlists, filterValue);
        return sortPlaylists(filteredPlaylists, sortOrder);
    }, [playlists, filterValue, sortOrder]);

    const navigate = useNavigate();
    const { setEditPlaylistId } = useEditPlaylistIdStore();

    return (
        <div className="p-4 pb-20">
            {filteredAndSortedPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 xxs:grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAndSortedPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className={`relative bg-background hover:bg-secondary rounded-lg shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden 
            ${!playlist.songs || playlist.songs.length === 0 ? "" : ""}`}
                            onClick={() => {
                                if (
                                    playlist.songs &&
                                    playlist.songs.length > 0
                                ) {
                                    navigate("/songs", { state: { playlist } });
                                }
                            }}
                        >
                            <div className="flex flex-row gap-2 absolute top-2 right-2">
                                {/* Edit Button */}
                                <button
                                    className="bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none z-10"
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

                                {/* Export Button */}
                                <button
                                    className="bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportPlaylistData(playlist.id);
                                    }}
                                >
                                    <FileDownIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Album art */}
                            <div
                                className={`relative h-40 bg-gray-900 overflow-hidden ${
                                    !playlist.songs ||
                                    playlist.songs.length === 0
                                        ? "cursor-pointer opacity-50"
                                        : ""
                                }`}
                            >
                                {playlist.picture ? (
                                    <img
                                        src={playlist.picture}
                                        alt="Playlist Art"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black"></div>
                                )}

                                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                                    <div className="bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none">
                                        {playlist.songs &&
                                        playlist.songs.length > 0 ? (
                                            <PlayIcon className="w-6 h-6" />
                                        ) : (
                                            <XIcon className="w-6 h-6" /> // Empty or placeholder icon
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Playlist details */}
                            <div className="p-4">
                                <h2 className="text-foreground font-semibold text-lg truncate">
                                    {playlist.title}
                                </h2>
                                <p className="text-foreground text-sm truncate">
                                    {playlist.description}
                                </p>
                                <div className="text-foreground text-xs mt-1">
                                    {playlist.songs ? (
                                        <>
                                            <small>
                                                {t("songs")}:{" "}
                                                {playlist.songs.length}
                                            </small>
                                            {" - "}
                                        </>
                                    ) : (
                                        <>
                                            <small>{t("empty")}</small> {" - "}
                                        </>
                                    )}
                                    <small>
                                        {new Date(
                                            playlist.createdAt
                                        ).toLocaleDateString()}
                                    </small>{" "}
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
