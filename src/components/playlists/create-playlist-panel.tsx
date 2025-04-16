import { Button } from "@/components/ui/button";
import { CirclePlusIcon, EditIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { convertToBase64 } from "@/lib/utils/images";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPlaylistSchema } from "@/form-schemas/create-playlist-schema";
import { Playlist } from "@/types/playlists/playlist";
import { v4 as uuidv4 } from "uuid";
import { useStorage } from "@/providers/storage-provider";
import { ArrowLeftRightIcon } from "lucide-react";
import { Song } from "@/types/songs/song";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/store/player-store";
import { useImageSelector } from "@/hooks/use-image-selector";
import { TagInput } from "../tag-input";

type FormSchema = z.infer<typeof createPlaylistSchema>;

export default function CreatePlaylistPanel() {
    const createPlaylistForm = useForm<z.infer<typeof createPlaylistSchema>>({
        resolver: zodResolver(createPlaylistSchema),
        mode: "onBlur",
        defaultValues: {
            title: undefined,
            description: undefined,
            picture: undefined,
            tags: [],
        },
    });
    const {
        handleSubmit,
        register,
        getValues,
        setValue,
        watch,
        formState: { isValid },
    } = createPlaylistForm;

    const { store } = useStorage();
    const navigate = useNavigate();
    const { isPlayerVisible } = usePlayerStore();

    const titleValue = watch("title");

    // add songs ----------------------------------------------------------------

    const [leftSongs, setLeftSongs] = useState<Song[]>([]);
    const [rightSongs, setRightSongs] = useState<Song[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchSongs = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            try {
                const storedPlaylists = (await store.get("playlists")) || [];
                const playlists = Array.isArray(storedPlaylists)
                    ? storedPlaylists
                    : [];
                const allSongsMap = new Map();

                // Extract unique songs
                playlists.forEach((playlist: any) => {
                    if (playlist.songs) {
                        playlist.songs.forEach((song: Song) => {
                            if (!allSongsMap.has(song.id)) {
                                allSongsMap.set(song.id, song);
                            }
                        });
                    }
                });

                setLeftSongs(Array.from(allSongsMap.values()));
            } catch (error) {
                console.error("Failed to fetch songs:", error);
            }
        };

        fetchSongs();
    }, [store]);

    const handleMoveToRight = (song: Song) => {
        setLeftSongs((prev) => prev.filter((s) => s.id !== song.id));
        setRightSongs((prev) => [...prev, song]);
    };

    const handleMoveToLeft = (song: Song) => {
        setRightSongs((prev) => prev.filter((s) => s.id !== song.id));
        setLeftSongs((prev) => [...prev, song]);
    };

    const filteredLeftSongs = leftSongs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // end add songs ----------------------------------------------------------------

    // image ----------------------------------------------------------------

    const { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    const onSubmit = async (data: FormSchema) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        const id = uuidv4();
        const createdAt = new Date();
        const updatedAt = new Date();

        const playlist: Playlist = {
            ...data,
            id,
            createdAt,
            updatedAt,
            songs: rightSongs,
        };

        try {
            // Load existing playlists
            const existingPlaylists: Playlist[] =
                (await store.get("playlists")) || [];

            // Check for duplicate ID
            const duplicate = existingPlaylists.some((p) => p.id === id);
            if (duplicate) {
                toast("Error", {
                    description: "A playlist with this ID already exists.",
                });
                return;
            }

            // Check for duplicate playlist title
            const duplicateTitle = existingPlaylists.some(
                (p) => p.title === titleValue
            );
            if (duplicateTitle) {
                toast("Error", {
                    description: "A playlist with this title already exists.",
                });
                return;
            }

            // Add the new playlist
            const updatedPlaylists = [...existingPlaylists, playlist];

            // Save updated playlists back to storage
            await store.set("playlists", updatedPlaylists);
            await store.save();

            console.log("The playlist has been successfully added.");

            toast("Playlist Created", {
                description: "Your new playlist has been created.",
            });

            navigate("/playlists");
        } catch (ex) {
            console.error("The playlist could not be created:", ex);
        }
    };

    return (
        <div className={` ${isPlayerVisible ? "pb-48" : "pb-16"}`}>
            {/* Create Playlist Card */}
            <div className="p-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">Create Playlist</h1>
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
                                            initialTags={getValues("tags")} // Initial tags from form state
                                            onChange={
                                                (updatedTags) =>
                                                    setValue(
                                                        "tags",
                                                        updatedTags,
                                                        {
                                                            shouldValidate:
                                                                false,
                                                        }
                                                    ) // Update form state when tags change
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

                            {/* Platlist Art */}
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
                            Create <CirclePlusIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
