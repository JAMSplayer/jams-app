import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CirclePlusIcon, EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { editSongSchema } from "@/form-schemas/edit-song-schema";
import { useStorage } from "@/providers/storage-provider";
import { Song } from "@/types/songs/song";
import { useImageSelector } from "@/hooks/use-image-selector";
import { TagInput } from "../tag-input";
import { useNavigate, useParams } from "react-router-dom";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import SelectYear from "../select-year";
import { Playlist } from "@/types/playlists/playlist";
import { toast } from "sonner";
import { usePlayerStore } from "@/store/player-store";

interface EditSongPanelProps {
    onReturn?: () => void;
}

export default function EditSongPanel({ onReturn }: EditSongPanelProps) {
    const editSongForm = useForm<z.infer<typeof editSongSchema>>({
        resolver: zodResolver(editSongSchema),
        mode: "onBlur",
        defaultValues: {
            title: undefined,
            artist: undefined,
            picture: undefined,
            tags: [],
            album: undefined,
            genre: undefined,
            year: undefined,
            trackNumber: undefined,
        },
    });

    const {
        handleSubmit,
        register,
        getValues,
        setValue,
        formState: { isValid },
    } = editSongForm;

    type editSongFormData = z.infer<typeof editSongSchema>;

    const navigate = useNavigate();
    const { store } = useStorage();
    const [song, setSong] = useState<Song | undefined>(undefined);
    const { xorname } = useParams<{ xorname: string }>();
    const { isPlayerVisible } = usePlayerStore();

    if (!xorname) {
        return <p>No Song xorname provided.</p>;
    }

    const handleReturn = () => {
        if (onReturn) {
            onReturn();
        } else {
            navigate(-1); // Go back if no onReturn provided
        }
    };

    // Load song metadata and populate form fields and songs ----------------------------------------------------------------

    useEffect(() => {
        const fetchSongData = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            if (!xorname) {
                console.error("Song xorname is missing.");
                return;
            }

            const defaultDownloadFolder = await store.get<{ value: string }>(
                "download-folder"
            );
            if (!defaultDownloadFolder || !defaultDownloadFolder.value) {
                console.error("No default download folder found.");
                return;
            }

            try {
                // fetch all playlists from the store
                const storedPlaylists = await store.get("playlists");

                if (!storedPlaylists || !Array.isArray(storedPlaylists)) {
                    console.error("Playlists not found or invalid format.");
                    return;
                }

                // flatten all songs from all playlists
                const allSongs: Song[] = storedPlaylists.flatMap(
                    (playlist: Playlist) => playlist.songs || []
                );

                // find the song with the matching xorname
                const foundSong = allSongs.find((s) => s.xorname === xorname);

                console.log("found: ", foundSong);

                if (!foundSong) {
                    console.error("Song Metadata not found.");
                    return;
                } else {
                    // set the song with these values - later if the user updates the fields, just those fields should be updated on the song object
                    setSong(foundSong);
                    console.log("setting song: ", foundSong);
                }

                // set tags from the song if available
                setValue("tags", foundSong.tags || [], {
                    shouldValidate: true,
                });

                setValue("title", foundSong.title, {
                    shouldValidate: true,
                });
                setValue("artist", foundSong.artist ?? undefined, {
                    shouldValidate: true,
                });
                setValue("album", foundSong.album ?? "", {
                    shouldValidate: true,
                });
                setValue("genre", foundSong.genre ?? "", {
                    shouldValidate: true,
                });
                setValue("year", foundSong.year ?? undefined, {
                    shouldValidate: true,
                });
                setValue("trackNumber", foundSong.trackNumber ?? 0, {
                    shouldValidate: true,
                });
                setValue("picture", foundSong.picture ?? undefined, {
                    shouldValidate: true,
                });
            } catch (error) {
                console.error("Failed to load song data:", error);
            }
        };

        fetchSongData();
    }, [store, xorname, setValue]);

    // end Load song data and populate form fields and songs ----------------------------------------------------------------

    // image ----------------------------------------------------------------

    const { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    const handleYearChange = async (newYear: number | undefined) => {
        setSong((prevSong) =>
            prevSong ? { ...prevSong, year: newYear } : undefined
        );
    };

    // submit handler
    const onSubmit = async (data: editSongFormData) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        if (!song) {
            console.error("Song not found.");
            return;
        }

        const updatedSong: Song = { ...song }; // copy properties from existing song

        if (data.title) {
            updatedSong.title = data.title;
        }
        if (data.artist) {
            updatedSong.artist = data.artist;
        }
        if (data.picture) {
            updatedSong.picture = data.picture;
        }
        if (data.album) {
            updatedSong.album = data.album;
        }
        if (data.genre) {
            updatedSong.genre = data.genre;
        }
        if (data.trackNumber) {
            updatedSong.trackNumber = data.trackNumber;
        }
        if (data.tags) {
            updatedSong.tags = data.tags;
        }

        setSong(updatedSong); // update the state with the modified song
        await updateSongInStore(updatedSong);
        handleReturn();
    };

    const updateSongInStore = async (updatedSong: Song) => {
        if (store) {
            try {
                // fetch playlists from the store
                const storedPlaylists: Playlist[] =
                    (await store.get("playlists")) || [];

                // loop through each playlist and find the song
                for (let playlist of storedPlaylists) {
                    if (playlist.songs) {
                        // ensure songs exists
                        const songIndex = playlist.songs.findIndex(
                            (song) => song.xorname === xorname
                        );

                        if (songIndex !== -1) {
                            // ensure song is found
                            playlist.songs[songIndex] = updatedSong; // update the song
                            await store.set("playlists", storedPlaylists); // save updated playlists
                            await store.save();
                            break;
                        } else {
                            toast("Song Not Found", {
                                description:
                                    "The song with the provided xorname does not exist in the store.",
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to update song:", error);
            }
        }
    };

    return (
        <div className={` ${isPlayerVisible ? "pb-48" : "pb-16"}`}>
            {/* Header */}
            <div className="w-full sticky top-[3.5rem] bg-background z-30 border-b border-t border-secondary p-2 border-l flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Back Button */}
                    <Button variant={"ghost"} onClick={handleReturn}>
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>
            </div>

            {/* Edit Song Metadata Card */}
            <div className="p-4">
                <div className="bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center">
                    <h1 className="text-lg font-bold">Edit Song Metadata</h1>
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <Form {...editSongForm}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Form Fields */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="w-full">
                                            <FormField
                                                control={editSongForm.control}
                                                name="title"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter title"
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                autoCorrect="off"
                                                                {...register(
                                                                    "title"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Artist */}
                                        <div className="w-full">
                                            <FormField
                                                control={editSongForm.control}
                                                name="artist"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Artist
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter artist"
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                autoCorrect="off"
                                                                {...register(
                                                                    "artist"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Album */}
                                        <div className="w-full">
                                            <FormField
                                                control={editSongForm.control}
                                                name="album"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Album
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter album"
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                autoCorrect="off"
                                                                {...register(
                                                                    "album"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Genre */}
                                        <div className="w-full">
                                            <FormField
                                                control={editSongForm.control}
                                                name="genre"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Genre
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter genre"
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                autoCorrect="off"
                                                                {...register(
                                                                    "genre"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Year */}
                                        <div className="w-full">
                                            <SelectYear
                                                currentYear={song?.year}
                                                onChange={handleYearChange}
                                                height="200px"
                                            />
                                        </div>

                                        {/* Track Number */}
                                        <div className="w-full">
                                            <FormField
                                                control={editSongForm.control}
                                                name="trackNumber"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Track Number
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter track number"
                                                                autoCapitalize="off"
                                                                autoComplete="off"
                                                                autoCorrect="off"
                                                                {...register(
                                                                    "trackNumber"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full">
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
                                </div>

                                {/* Album Art */}
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
                                            No Song Art
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
                            <div className="pt-4">
                                <Button
                                    size={"sm"}
                                    type="submit"
                                    className="mr-3"
                                    disabled={!isValid}
                                >
                                    Save <CirclePlusIcon />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
