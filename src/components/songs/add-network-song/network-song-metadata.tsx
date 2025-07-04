import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CirclePlusIcon, EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { editSongSchema } from "@/form-schemas/edit-song-schema";
import { useStorage } from "@/providers/storage-provider";
import { Song } from "@/types/songs/song";
import { PlaylistSelectionModal } from "@/components/ui/playlist-selection-modal";
import { v4 as uuidv4 } from "uuid";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { TagInput } from "@/components/tag-input";
import SelectYear from "@/components/select-year";
import { useImageSelector } from "@/hooks/use-image-selector";
import { NetworkFileDetail } from "@/types/network-file-detail";
import { Playlist } from "@/types/playlists/playlist";
import { toast } from "sonner";
import { isIDUnique } from "@/lib/utils/validation";
import { usePlayerStore } from "@/store/player-store";

interface NetworkSongMetadataPanelProps {
    fileDetail: NetworkFileDetail | null;
    onReturn: () => void;
}

export default function NetworkSongMetadataPanel({
    fileDetail,
    onReturn,
}: NetworkSongMetadataPanelProps) {
    const networkSongForm = useForm<z.infer<typeof editSongSchema>>({
        resolver: zodResolver(editSongSchema),
        mode: "onBlur",
        defaultValues: {
            title: undefined,
            artist: undefined,
            picture: undefined,
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
    } = networkSongForm;

    type networkSongFormData = z.infer<typeof editSongSchema>;

    const { store } = useStorage();

    const { isPlayerVisible } = usePlayerStore();

    // this song object will be saved once populated
    const [song, setSong] = useState<Song | undefined>(undefined);

    const [tags, setTags] = useState<string[]>([]);

    // this playlist selector modal will show when the user clicks save. It allow the user to decide what playlist to place the song.
    const [
        isPlaylistSelectionModalVisible,
        setIsPlaylistSelectionModalVisible,
    ] = useState(false);

    // should never be reached
    if (!fileDetail) {
        return (
            <div>
                <p className="text-red-500">No file metadata available.</p>
                <Button onClick={onReturn}>Go Back</Button>
            </div>
        );
    }

    // Load song metadata and populate form fields and songs ----------------------------------------------------------------

    // this should only happen when the component mounts and the store and id is present
    useEffect(() => {
        const updateFields = async () => {
            try {
                // Populate form fields from metadata
                setValue("title", fileDetail.title ?? "", {
                    shouldValidate: true,
                });
                setValue("artist", fileDetail.artist ?? undefined, {
                    shouldValidate: true,
                });
                setValue("album", fileDetail.album ?? "", {
                    shouldValidate: true,
                });
                setValue("genre", fileDetail.genre ?? "", {
                    shouldValidate: true,
                });
                setValue("year", fileDetail.year ?? 1800, {
                    shouldValidate: true,
                });
                setValue("trackNumber", fileDetail.trackNumber ?? 0, {
                    shouldValidate: true,
                });
                setValue("picture", fileDetail.picture ?? undefined, {
                    shouldValidate: true,
                });
            } catch (error) {
                console.error("Failed to load song data:", error);
            }
        };

        updateFields();
    }, [fileDetail]);

    // end Load song data and populate form fields and songs ----------------------------------------------------------------

    // image ----------------------------------------------------------------

    let { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    // submit handler
    const onSubmit = async (data: networkSongFormData) => {
        if (!store) {
            console.error("Store is not initialized.");
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
            const updatedSong: Song = {
                id: uuidv4(),
                dateCreated: new Date(),
                xorname: fileDetail.xorname,
                fileName: fileDetail.fileName,
                extension: fileDetail.extension,
                downloadFolder: defaultDownloadFolder.value,
                ...data,
                tags,
            };

            // ensure id is unique throughout all playlists:
            const playlists: Playlist[] = (await store.get("playlists")) || [];
            const idUnique = isIDUnique(updatedSong.id, playlists);
            if (!idUnique) {
                toast("ID not Unique", {
                    description: "The id needs to be unique",
                });
                return;
            }

            setSong(updatedSong);

            // find which playlist to update to add new song to.
            // await store.set("playlists", updatedPlaylists);
            // await store.save();

            setIsPlaylistSelectionModalVisible(true);

            // toast("Song Saved Locally", {
            //     description:
            //         "Your selected network song has been successfully saved to the ? playlist.",
            // });
        } catch (ex) {
            console.error("The save operation could not be completed:", ex);
        }
    };

    const handleYearChange = async (newYear: number | undefined) => {
        setSong((prevSong) =>
            prevSong ? { ...prevSong, year: newYear } : undefined
        );
    };

    const handleReturn = async () => {
        onReturn(); // Pass the ID to the parent component
    };

    return (
        <div className={` ${isPlayerVisible ? "pb-48" : "pb-16"}`}>
            {isPlaylistSelectionModalVisible && song && (
                <PlaylistSelectionModal
                    onConfirm={(playlistId) => {
                        console.log(
                            "Song added to playlist with ID:",
                            playlistId
                        );
                        setIsPlaylistSelectionModalVisible(false); // Close modal after confirming
                        onReturn();
                    }}
                    onCancel={() => setIsPlaylistSelectionModalVisible(false)} // Close modal on cancel
                    song={song}
                />
            )}

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
                    <Form {...networkSongForm}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Form Fields */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="w-full">
                                            <FormField
                                                control={
                                                    networkSongForm.control
                                                }
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
                                                control={
                                                    networkSongForm.control
                                                }
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
                                                control={
                                                    networkSongForm.control
                                                }
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
                                                control={
                                                    networkSongForm.control
                                                }
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
                                                control={
                                                    networkSongForm.control
                                                }
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
                                        {/* Tags Input */}
                                        <TagInput
                                            tags={tags} // Initial tags from form state
                                            onChange={
                                                (updatedTags) =>
                                                    setTags(updatedTags) // Update form state when tags change
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
