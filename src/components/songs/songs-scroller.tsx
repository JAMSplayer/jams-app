import { useEffect, useMemo, useState } from "react";
import { EditIcon, HeartIcon, PlayIcon, XIcon } from "lucide-react";
import { Song } from "@/types/songs/song";
import { useAudioPlayer } from "../player/audio-provider";
import { usePlayerStore } from "@/store/player-store";
import { useTranslation } from "react-i18next";
import { Playlist } from "@/types/playlists/playlist";
import { useStorage } from "@/providers/storage-provider";
import { AlertConfirmationModal } from "../alert-confirmation-modal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SongScrollerProps {
    songs: Song[];
    playlists: Playlist[];
    filterValue: string;
    sortOrder: "asc" | "desc";
    variant: string;
    onSongDeleted?: () => void;
}

const SongScroller = ({
    songs,
    playlists,
    filterValue,
    sortOrder,
    variant,
    onSongDeleted,
}: SongScrollerProps) => {
    const { t } = useTranslation();
    const { store } = useStorage();
    const navigate = useNavigate();

    const { setPlayerVisibility, setHasLoaded } = usePlayerStore();
    const player = useAudioPlayer();

    const handlePlaySong = (song: Song) => {
        setPlayerVisibility(true);
        setHasLoaded(true);
        player.play(song);
    };

    const filterSongs = (songs: Song[], filterValue: string): Song[] => {
        const trimmedFilterValue = filterValue.trim().toLowerCase();
        if (!trimmedFilterValue) return songs;

        const exactMatches = songs.filter((song) =>
            [song.title, song.artist].some(
                (field) => field?.toLowerCase() === trimmedFilterValue
            )
        );
        if (exactMatches.length > 0) return exactMatches;

        return songs.filter((song) =>
            [song.title, song.artist].some((field) =>
                field?.toLowerCase().includes(trimmedFilterValue)
            )
        );
    };

    const sortSongs = (songs: Song[], sortOrder: "asc" | "desc") => {
        return songs.sort((a, b) => {
            const dateA = new Date(a.dateCreated);
            const dateB = new Date(b.dateCreated);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            return sortOrder === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        });
    };

    const filteredAndSortedSongs = useMemo(() => {
        const filtered = filterSongs(songs, filterValue);
        return sortSongs(filtered, sortOrder);
    }, [songs, filterValue, sortOrder]);

    const findPlaylistsBySongXorname = (xorname: string): string[] => {
        if (!Array.isArray(playlists)) return [];
        return playlists
            .filter((playlist) =>
                playlist.songs?.some((song) => song.xorname === xorname)
            )
            .map((playlist) => playlist.title);
    };

    const [
        isDeleteConfirmationModalVisible,
        setDeleteConfirmationModalVisible,
    ] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setSelectedSongId(id);
        setDeleteConfirmationModalVisible(true);
    };

    const handleEditClick = (xorname: string) => {
        navigate(`/edit-song/${xorname}`);
    };

    const handleConfirm = async () => {
        if (!store || !selectedSongId) return;
        try {
            const storedPlaylists: Playlist[] =
                (await store.get("playlists")) || [];
            const updatedPlaylists = storedPlaylists.map((playlist) => ({
                ...playlist,
                songs:
                    playlist.songs?.filter(
                        (song) => song.id !== selectedSongId
                    ) || [],
            }));
            await store.set("playlists", updatedPlaylists);
            await store.save();
            toast("Song Deleted", {
                description: "Your song has been deleted from all playlists.",
            });
            if (onSongDeleted) onSongDeleted();
        } catch (error) {
            console.error("Failed to delete the song:", error);
        }
        setDeleteConfirmationModalVisible(false);
        setSelectedSongId(null);
    };

    const handleCancel = () => {
        setDeleteConfirmationModalVisible(false);
        setSelectedSongId(null);
    };

    const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);

    useEffect(() => {
        const loadFavoriteSongs = async () => {
            if (!store) return;
            try {
                const storedFavorites: string[] =
                    (await store.get("favorites")) || [];
                setFavoriteSongs(storedFavorites);
            } catch (err) {
                console.error("Failed to load favorite songs:", err);
            }
        };
        loadFavoriteSongs();
    }, []);

    const handleFavoriteClicked = async (id: string) => {
        if (!store) return;
        const updatedFavorites = favoriteSongs.includes(id)
            ? favoriteSongs.filter((favId) => favId !== id)
            : [...favoriteSongs, id];

        try {
            setFavoriteSongs(updatedFavorites);
            await store.set("favorites", updatedFavorites);
            await store.save();
        } catch (error) {
            console.error("Failed to update favorites:", error);
        }
    };

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
                            {/* album art */}
                            <div className="relative flex-shrink-0 w-20 md:max-h-20 bg-background rounded-l-lg overflow-hidden">
                                {song.picture ? (
                                    <img
                                        src={song.picture}
                                        alt="Album Art"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300"></div>
                                )}

                                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none">
                                        <PlayIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                            {/* song details */}
                            <div className="grid grid-cols-1 md:grid-cols-4 w-full">
                                {/* first column (left) */}
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

                                {/* second column (left) */}
                                <div className="flex justify-start p-2">
                                    <div className="flex flex-col justify-start">
                                        <h2 className="text-foreground font-semibold truncate">
                                            <p>
                                                <small>
                                                    Playlists:{" "}
                                                    {findPlaylistsBySongXorname(
                                                        song.xorname
                                                    ).length > 0
                                                        ? findPlaylistsBySongXorname(
                                                              song.xorname
                                                          ).join(", ")
                                                        : "Not found"}
                                                </small>
                                            </p>
                                            <p>
                                                <small>
                                                    Artist: {song.artist}
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
                                                    handleFavoriteClicked(
                                                        song.id
                                                    );
                                                }}
                                                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none "bg-background border border-primary text-primary hover:bg-primary hover:text-background"
                                                }`}
                                            >
                                                <HeartIcon
                                                    className={`w-4 h-4 transition-colors duration-200 hover:fill-red-500 hover:stroke-red-500 ${
                                                        favoriteSongs.includes(
                                                            song.id
                                                        )
                                                            ? "text-red-500"
                                                            : "text-primary"
                                                    }`}
                                                    fill={
                                                        favoriteSongs.includes(
                                                            song.id
                                                        )
                                                            ? "red"
                                                            : "none"
                                                    }
                                                    stroke={
                                                        favoriteSongs.includes(
                                                            song.id
                                                        )
                                                            ? "red"
                                                            : "currentColor"
                                                    }
                                                />
                                            </button>
                                            {/* Edit button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(
                                                        song.xorname
                                                    );
                                                }}
                                                className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            {/* Delete button */}
                                            {variant == "favorites" ? (
                                                <></>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(
                                                            song.id
                                                        ); // Pass song.id
                                                    }}
                                                    className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-destructive dark:hover:text-white hover:text-background transition-colors duration-200 focus:outline-none"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            )}
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
                                            handleFavoriteClicked(song.id);
                                        }}
                                        className={`p-2 rounded-full transition-colors duration-200 focus:outline-none "bg-background border border-primary text-primary hover:bg-primary hover:text-background"
                                                }`}
                                    >
                                        <HeartIcon
                                            className={`w-4 h-4 transition-colors duration-200 hover:fill-red-500 hover:stroke-red-500 ${
                                                favoriteSongs.includes(song.id)
                                                    ? "text-red-500"
                                                    : "text-primary"
                                            }`}
                                            fill={
                                                favoriteSongs.includes(song.id)
                                                    ? "red"
                                                    : "none"
                                            }
                                            stroke={
                                                favoriteSongs.includes(song.id)
                                                    ? "red"
                                                    : "currentColor"
                                            }
                                        />
                                    </button>
                                    {/* Edit button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(song.xorname);
                                        }}
                                        className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors duration-200 focus:outline-none"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    {/* Delete button */}
                                    {variant == "favorites" ? (
                                        <></>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(song.id); // Pass song.id
                                            }}
                                            className="bg-background border border-primary text-primary p-2 rounded-full hover:bg-destructive hover:text-background dark:hover:text-white transition-colors duration-200 focus:outline-none"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>{t("noSongsFound")}</p>
                )}
            </div>
        </div>
    );
};

export default SongScroller;
