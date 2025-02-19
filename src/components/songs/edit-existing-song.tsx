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
import { t } from "i18next";

type FormSchema = z.infer<typeof editSongSchema>;

interface EditSongPanelProps {
    id: string | null;
    onReturn: () => void;
}

export default function EditSongPanel({ id, onReturn }: EditSongPanelProps) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isValid },
    } = useForm<FormSchema>({
        resolver: zodResolver(editSongSchema),
        mode: "onBlur",
        defaultValues: {
            title: undefined,
            description: undefined,
            picture: undefined,
            tags: [],
            trackNumber: undefined,
        },
    });

    const { store } = useStorage();

    const [song, setSong] = useState<Song | undefined>(undefined);

    if (!id) {
        return <p>No Song ID provided.</p>;
    }

    // Load song metadata and populate form fields and songs ----------------------------------------------------------------

    useEffect(() => {
        const fetchSongData = async () => {
            if (!store) {
                console.error("Store is not initialized.");
                return;
            }

            if (!id) {
                console.error("Song network ID is missing.");
                return;
            }

            try {
                const song: Song = {
                    id: "123",
                    xorname: "123",
                    title: "test",
                    artist: "test",
                    dateCreated: new Date(),
                    location: "test",
                    picture: undefined,
                    tags: [],
                    trackNumber: undefined,
                };

                if (!song) {
                    console.error("Song Metadata not found.");
                    return;
                }

                // Set tags from the song if available
                setValue("tags", song.tags || [], { shouldValidate: true });

                // set track number from the song if available
                setValue("trackNumber", song.trackNumber);

                // Populate form fields
                setValue("title", song.title);
                setValue("description", song.description);
                setValue("picture", song.picture);
            } catch (error) {
                console.error("Failed to load song data:", error);
            }
        };

        fetchSongData();
    }, [store, id, setValue]);

    // end Load song data and populate form fields and songs ----------------------------------------------------------------

    // image ----------------------------------------------------------------

    const { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    // submit handler
    const onSubmit = async (data: FormSchema) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        try {
            const updatedSong: Song = {
                ...data,
                id,
                tags: [],
                xorname: "123",
                artist: "test",
                dateCreated: new Date(),
                location: "test,",
                picture: undefined,
            };

            setSong(updatedSong);

            // find which playlist to update to add new song to.
            // await store.set("playlists", updatedPlaylists);
            // await store.save();

            // toast("Song Updated Locally", {
            //     description:
            //         "Your song has been successfully updated.",
            // });
        } catch (ex) {
            console.error("The save operation could not be completed:", ex);
        }
    };

    const handleReturn = async () => {
        onReturn(); // Pass the ID to the parent component
    };

    return (
        <div className="pb-16">
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
                                        {errors.title && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.title.message}
                                            </div>
                                        )}
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
                                        {errors.description && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.description.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        {/* Track Number */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                {t("trackNumber")}
                                            </label>
                                            <input
                                                type="number"
                                                {...register("trackNumber")}
                                                className="w-full border px-2 py-1 rounded"
                                                placeholder={t(
                                                    "enterTrackNumber"
                                                )}
                                            />

                                            {errors.trackNumber && (
                                                <span className="text-red-500 text-sm">
                                                    {errors.trackNumber.message}
                                                </span>
                                            )}
                                        </div>

                                        <TagInput
                                            initialTags={getValues("tags")} // Initial tags from form state
                                            onChange={
                                                (updatedTags) =>
                                                    setValue(
                                                        "tags",
                                                        updatedTags,
                                                        { shouldValidate: true }
                                                    ) // Update form state when tags change
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Song Art */}
                            <div className="flex justify-center items-center relative">
                                {selectedImage ? ( // ✅ Only check for selectedImage
                                    <img
                                        src={selectedImage}
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
                    </form>
                    <div className="pt-4">
                        <Button
                            size={"sm"}
                            type="submit"
                            form="customizeForm"
                            className="mr-3"
                            disabled={!isValid}
                        >
                            Save <CirclePlusIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
