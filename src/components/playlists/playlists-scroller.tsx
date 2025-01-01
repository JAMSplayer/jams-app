import { useMemo } from "react";
import { EditIcon, PlayIcon, XIcon } from "lucide-react";
import { Playlist } from "@/types/playlists/playlist";
import { useNavigate } from "react-router-dom";

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
            if (sortOrder === "asc") {
                return a.createdAt.getTime() - b.createdAt.getTime();
            } else {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
        });
    };

    const filteredAndSortedPlaylists = useMemo(() => {
        let filteredPlaylists = filterPlaylists(playlists, filterValue);
        return sortPlaylists(filteredPlaylists, sortOrder);
    }, [playlists, filterValue, sortOrder]);

    const navigate = useNavigate();

    return (
        <div className="p-4">
            {filteredAndSortedPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 xxs:grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAndSortedPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className={`relative bg-background hover:bg-secondary rounded-lg shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden 
            ${
                !playlist.songs || playlist.songs.length === 0
                    ? "cursor-pointer opacity-50"
                    : ""
            }`}
                            onClick={() => {
                                if (
                                    playlist.songs &&
                                    playlist.songs.length > 0
                                ) {
                                    navigate("/songs", { state: { playlist } });
                                }
                            }}
                        >
                            {/* Edit Button */}
                            <button
                                className="absolute top-2 right-2 bg-primary text-background p-2 rounded-full hover:bg-primary-dark focus:outline-none z-10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the parent click event
                                    navigate("/edit-playlist", {
                                        state: { id: playlist.id },
                                    });
                                }}
                            >
                                <EditIcon className="w-4 h-4" />
                            </button>

                            {/* Album art */}
                            <div className="relative h-40 bg-gray-900 overflow-hidden">
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
                                                Songs: {playlist.songs.length}
                                            </small>
                                            {" - "}
                                        </>
                                    ) : (
                                        <>
                                            <small>empty</small> {" - "}
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
                <p>No playlists found.</p>
            )}
        </div>
    );
};

export default PlaylistScroller;
