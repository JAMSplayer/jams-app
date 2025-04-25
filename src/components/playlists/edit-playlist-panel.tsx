import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CirclePlusIcon, EditIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { editPlaylistSchema } from "@/form-schemas/edit-playlist-schema";
import { Playlist } from "@/types/playlists/playlist";
import { useStorage } from "@/providers/storage-provider";
import { ArrowLeftRightIcon } from "lucide-react";
import { Song } from "@/types/songs/song";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { AlertConfirmationModal } from "../alert-confirmation-modal";
import { useImageSelector } from "@/hooks/use-image-selector";
import { TagInput } from "../tag-input";
// import Portal from "../portal";

type FormSchema = z.infer<typeof editPlaylistSchema>;

interface EditPlaylistPanelProps {
    id: string;
}

export default function EditPlaylistPanel({ id }: EditPlaylistPanelProps) {
    const editPlaylistForm = useForm<z.infer<typeof editPlaylistSchema>>({
        resolver: zodResolver(editPlaylistSchema),
        mode: "onBlur",
        defaultValues: {
            title: undefined,
            description: undefined,
            picture: undefined,
        },
    });
    const {
        handleSubmit,
        register,
        getValues,
        setValue,
        watch,
        formState: { isValid },
    } = editPlaylistForm;

    const { store } = useStorage();
    const navigate = useNavigate();

    const [leftSongs, setLeftSongs] = useState<Song[]>([]);
    const [rightSongs, setRightSongs] = useState<Song[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteEnabled, setDeleteEnabled] = useState(true);

    const titleValue = watch("title");
    const [tags, setTags] = useState<string[]>([]);
    // Load playlist data and populate form fields and songs ----------------------------------------------------------------

    useEffect(() => {
        console.log("TAGS from tags value!: ", tags);
    }, [tags]);

    useEffect(() => {
        const fetchPlaylistData = async () => {
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

                // Ensure playlists is an array
                const storedPlaylists = Array.isArray(playlists)
                    ? (playlists as Playlist[])
                    : [];

                const playlist = storedPlaylists.find(
                    (p: Playlist) => p.id === id
                );

                if (!playlist) {
                    console.error("Playlist not found.");
                    return;
                }

                // Populate form fields
                setValue("title", playlist.title, { shouldValidate: true });
                if (playlist.title?.toLocaleLowerCase() === "general") {
                    setDeleteEnabled(false);
                }
                setValue("description", playlist.description, {
                    shouldValidate: true,
                });

                setValue("picture", playlist.picture, { shouldValidate: true });
                console.log("POP: ", playlist.tags);
                if (playlist.tags && playlist.tags.length > 0) {
                    setTags(playlist.tags);
                }

                // Populate rightSongs with playlist songs
                setRightSongs(playlist.songs || []);

                // Populate leftSongs with all songs excluding those in the playlist
                const allSongsMap = new Map();
                storedPlaylists.forEach((p) => {
                    if (p.songs) {
                        p.songs.forEach((song: Song) => {
                            if (!allSongsMap.has(song.id)) {
                                allSongsMap.set(song.id, song);
                            }
                        });
                    }
                });

                const rightSongIds = new Set(
                    (playlist.songs || []).map((song) => song.id)
                );

                const filteredLeftSongs = Array.from(
                    allSongsMap.values()
                ).filter((song) => !rightSongIds.has(song.id));

                setLeftSongs(filteredLeftSongs);
            } catch (error) {
                console.error("Failed to load playlist data:", error);
            }
        };

        fetchPlaylistData();
    }, [store, id, setValue]);

    // end Load playlist data and populate form fields and songs ----------------------------------------------------------------

    // Handle moving songs between boxes
    const handleMoveToRight = (song: Song) => {
        setLeftSongs((prev) => prev.filter((s) => s.id !== song.id));
        setRightSongs((prev) => [...prev, song]);
    };

    const handleMoveToLeft = (song: Song) => {
        setRightSongs((prev) => prev.filter((s) => s.id !== song.id));
        setLeftSongs((prev) => [...prev, song]);
    };

    // Filter left songs based on search term
    const filteredLeftSongs = leftSongs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // image ----------------------------------------------------------------

    const { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    // delete confirmation modal ----------------------------------------------------------------

    const [
        isDeleteConfirmationModalVisible,
        setDeleteConfirmationModalVisible,
    ] = useState(false);

    const handleDeletionConfirm = async () => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            // Retrieve existing playlists from the store
            const storedPlaylists: Playlist[] =
                (await store.get("playlists")) || [];

            // Ensure playlists is an array
            if (!Array.isArray(storedPlaylists)) {
                console.error(
                    "Playlists are not in the expected array format."
                );
                return;
            }

            // Filter out the playlist with the given ID
            const updatedPlaylists = storedPlaylists.filter(
                (playlist) => playlist.id !== id
            );

            // Save the updated playlists back to the store
            await store.set("playlists", updatedPlaylists);
            await store.save();

            toast("Playlist Deleted", {
                description: "Your playlist has been deleted.",
            });

            // Navigate away after deletion (e.g., back to playlist list)
            navigate("/playlists");
        } catch (error) {
            console.error("Failed to delete the playlist:", error);
        }
        setDeleteConfirmationModalVisible(false);
    };

    const handleCancel = () => {
        setDeleteConfirmationModalVisible(false);
    };

    // end delete confirmation modal ----------------------------------------------------------------

    // Update the existing playlist in storage
    const onSubmit = async (data: FormSchema) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            const storedPlaylists: Playlist[] =
                (await store.get("playlists")) || [];

            const originalPlaylist = storedPlaylists.find(
                (p: Playlist) => p.id === id
            );

            if (!originalPlaylist) {
                console.error("Original playlist not found.");
                return;
            }

            const updatedPlaylist: Playlist = {
                ...data,
                id,
                createdAt: originalPlaylist.createdAt, // Retain the original createdAt value
                updatedAt: new Date(),
                songs: rightSongs,
                tags,
            };

            const updatedPlaylists = storedPlaylists.map((p: Playlist) =>
                p.id === id ? updatedPlaylist : p
            );

            await store.set("playlists", updatedPlaylists);
            await store.save();

            toast("Playlist Updated", {
                description: "Your playlist has been successfully updated.",
            });
        } catch (ex) {
            console.error("The playlist could not be updated:", ex);
        }
    };

    // Handler for the back button
    const handleBackButtonClick = () => {
        navigate(-1); // Go back to the previous page in history
    };

    return (
        <div className="pb-16">
            {isDeleteConfirmationModalVisible && (
                <AlertConfirmationModal
                    title="Confirm Deletion"
                    description="Are you sure you want to delete this playlist?"
                    onConfirm={handleDeletionConfirm}
                    onCancel={handleCancel}
                />
            )}

            {/* Header */}
            <div className="w-full sticky top-[3.5rem] bg-background z-30 border-b border-t border-secondary p-2 border-l flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Back Button */}

                    <Button variant={"ghost"} onClick={handleBackButtonClick}>
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>
            </div>

            {/* Edit Playlist Card */}
            <div className="p-4">
                <div className="bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center">
                    <h1 className="text-lg font-bold">Edit Playlist</h1>
                    {deleteEnabled && (
                        <Button
                            onClick={() =>
                                setDeleteConfirmationModalVisible(true)
                            }
                            variant="destructive"
                            className=" text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none"
                        >
                            Delete
                        </Button>
                    )}
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <form id="customizeForm" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Form Fields */}
                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Title */}
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium mb-1">
                                            Title{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("title")}
                                            className="w-full border px-2 py-1 rounded"
                                            maxLength={100}
                                            disabled={
                                                titleValue?.toLowerCase() ===
                                                "general"
                                            }
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium mb-1">
                                            Description{" "}
                                        </label>
                                        <input
                                            {...register("description")}
                                            className="w-full border px-2 py-1 rounded"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="col-span-3">
                                        {/* Tags Input */}

                                        <TagInput
                                            tags={tags} // Initial tags from form state
                                            onChange={
                                                (updatedTags) =>
                                                    setTags(updatedTags) // Update form state when tags change
                                            }
                                        />
                                    </div>

                                    <div className="col-span-3">
                                        {/* Songs Input */}
                                        <div className="flex items-center gap-4">
                                            {/* Left Scroll Area */}
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search songs"
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <ScrollArea className="h-80 border rounded">
                                                    {filteredLeftSongs.map(
                                                        (song) => (
                                                            <div
                                                                key={song.id}
                                                                onClick={() =>
                                                                    handleMoveToRight(
                                                                        song
                                                                    )
                                                                }
                                                                className="p-2 border-b hover:bg-secondary cursor-pointer"
                                                            >
                                                                <p className="font-medium break-words">
                                                                    {song.title}
                                                                </p>
                                                                <p className="text-sm text-gray-500 break-words">
                                                                    {
                                                                        song.artist
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </ScrollArea>
                                            </div>

                                            {/* Arrow Icon */}
                                            <div className="flex items-center justify-center">
                                                <ArrowLeftRightIcon className="w-6 h-6 text-gray-500" />
                                            </div>

                                            {/* Right Scroll Area */}
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-700">
                                                        Songs
                                                    </h3>
                                                </div>
                                                <ScrollArea className="h-80 border rounded">
                                                    {rightSongs.map((song) => (
                                                        <div
                                                            key={song.id}
                                                            onClick={() =>
                                                                handleMoveToLeft(
                                                                    song
                                                                )
                                                            }
                                                            className="p-2 border-b hover:bg-secondary cursor-pointer"
                                                        >
                                                            <p className="font-medium break-words">
                                                                {song.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500 break-words">
                                                                {song.artist}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Playlist Art */}
                            <div className="flex justify-center items-center relative">
                                {getValues("picture") || selectedImage ? (
                                    <img
                                        src={
                                            getValues("picture") ||
                                            selectedImage ||
                                            undefined
                                        }
                                        alt="Playlist Art"
                                        className="w-full h-full max-w-sm max-h-sm object-contain rounded-lg shadow cursor-pointer"
                                        onClick={handleImageUpload}
                                    />
                                ) : (
                                    <div className="w-full h-full max-w-sm max-h-sm min-h-44 max-h-96 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                                        No Playlist Art
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-full cursor-pointer">
                                    <EditIcon
                                        size={20}
                                        onClick={handleImageUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="pt-4">
                        <Button
                            size={"sm"}
                            type="submit"
                            form="customizeForm"
                            className="mr-3"
                            disabled={!isValid}
                        >
                            Update <CirclePlusIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
