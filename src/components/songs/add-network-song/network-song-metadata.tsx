import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CirclePlusIcon, EditIcon, XIcon } from "lucide-react";
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
import { editPlaylistSchema } from "@/form-schemas/edit-playlist-schema";
import { useStorage } from "@/providers/storage-provider";
import { Song } from "@/types/songs/song";
import { PlaylistSelectionModal } from "@/components/ui/playlist-selection-modal";

type FormSchema = z.infer<typeof editPlaylistSchema>;

interface NetworkSongMetadataPanelProps {
    id: string | null;
    onReturn: () => void;
}

export default function NetworkSongMetadataPanel({
    id,
    onReturn,
}: NetworkSongMetadataPanelProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid },
    } = useForm<FormSchema>({
        resolver: zodResolver(editPlaylistSchema),
        mode: "onChange",
        defaultValues: {
            title: undefined,
            description: undefined,
            picture: undefined,
        },
    });

    const { store } = useStorage();

    const [song, setSong] = useState<Song | undefined>(undefined);

    const [
        isPlaylistSelectionModalVisible,
        setIsPlaylistSelectionModalVisible,
    ] = useState(false);

    if (!id) {
        return <p>No Song Network ID provided.</p>;
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
                    title: "test",
                    artist: "test",
                    dateCreated: new Date(),
                    xorname: "test",
                    extension: "test",
                    fileName: "test",
                    downloadFolder: "test",
                    picture: "test",
                };

                if (!song) {
                    console.error("Song Metadata not found.");
                    return;
                }

                // Set tags from the song if available
                setTags(song.tags || []);

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

    const [base64Picture, setBase64Picture] = useState<string>("");

    // The image the user selects if they wish to change album art
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const pictureValue = base64Picture || selectedImage;
        if (pictureValue) {
            setValue("picture", pictureValue); // Update the form value whenever base64Picture or selectedImage changes
        }
    }, [base64Picture, selectedImage, setValue]);

    const handleImageSelect = async () => {
        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

        try {
            const selectedFile = await open({
                multiple: false,
                filters: [
                    {
                        name: "Images",
                        extensions: ["jpg", "jpeg", "png", "gif"],
                    },
                ],
            });

            if (!selectedFile) {
                toast("File", {
                    description: "No file selected.",
                });
                return;
            }

            // Read the file as binary
            const fileBuffer = await readFile(selectedFile as string);

            // Get extension
            const fileExtension = selectedFile.split(".").pop()?.toLowerCase();

            if (
                !fileExtension ||
                !["jpg", "jpeg", "png", "gif"].includes(fileExtension)
            ) {
                toast("Unsupported", {
                    description:
                        "Unsupported file format. Please upload a JPG, JPEG, PNG, or GIF file.",
                });
                return;
            }

            const extensionToMime: Record<string, string> = {
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
                gif: "image/gif",
            };

            // Validate the extension and find the MIME type
            const mimeType = extensionToMime[fileExtension];

            // Convert the binary file into a Blob
            const fileBlob = new Blob([new Uint8Array(fileBuffer)], {
                type: mimeType,
            });

            // Create a File object
            const file = new File(
                [fileBlob],
                `image.${fileExtension || "unknown"}`
            );

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                toast("File Size", {
                    description:
                        "File size exceeds 1MB. Please select a smaller file.",
                });
                return;
            }

            // Convert Blob to Base64
            const base64Image = await convertToBase64(fileBlob);
            console.log("base64Image: ", base64Image);

            // Update the image state
            setSelectedImage(base64Image); // Updates the selected image
            setBase64Picture(base64Image); // Updates the base64Picture state

            // Update the form value
            setValue("picture", base64Image);
        } catch (error) {
            console.error("Error processing the selected image:", error);
            toast("Error Processing Image", {
                description: "Error processing the selected image.",
            });
        }
    };

    // end image ----------------------------------------------------------------

    // tags ----------------------------------------------------------------

    const MAX_TAGS = 5;
    const MAX_TAG_LENGTH = 20;

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState<string>(""); // Input field for adding tags

    const addTag = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tagInput.trim().toLowerCase();

        // Regular expression to allow only letters and numbers
        const isValidTag = /^[a-zA-Z0-9]+$/.test(trimmedTag);

        // Only add tag if conditions are met
        if (
            isValidTag && // Tag must only contain letters and numbers
            trimmedTag &&
            trimmedTag.length <= MAX_TAG_LENGTH &&
            !tags.includes(trimmedTag) &&
            tags.length < MAX_TAGS
        ) {
            setTags((prevTags) => [...prevTags, trimmedTag]);
            setTagInput("");
        } else if (!isValidTag) {
            toast("Invalid Tag", {
                description: "Tags can only contain letters and numbers.",
            });
        } else if (trimmedTag.length > MAX_TAG_LENGTH) {
            toast("Tag Length", {
                description: `Tags must be ${MAX_TAG_LENGTH} characters or less.`,
            });
        }
    };

    const removeTag = (tag: string) => {
        setTags((prevTags) => prevTags.filter((t) => t !== tag));
    };

    // end tags ----------------------------------------------------------------

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
                tags,
                artist: "test",
                dateCreated: new Date(),
                xorname: "test,",
                fileName: "test,",
                extension: "test,",
                downloadFolder: "test,",
            };

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

    const handleReturn = async () => {
        onReturn(); // Pass the ID to the parent component
    };

    return (
        <div className="pb-16">
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

                                    <div className="col-span-1">
                                        {/* Tags Input */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Tags
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <Input
                                                    type="text"
                                                    autoCapitalize="off"
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    value={tagInput}
                                                    onChange={(e) =>
                                                        setTagInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter" &&
                                                            tagInput.trim()
                                                        ) {
                                                            addTag(e); // Call addTag function when Enter is pressed
                                                        }
                                                    }}
                                                    placeholder="Add a tag"
                                                    className="flex-1"
                                                    disabled={
                                                        tags.length >= MAX_TAGS
                                                    } // Disable input if max tags reached
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={addTag}
                                                    disabled={
                                                        tags.length >=
                                                            MAX_TAGS || // Max tags reached
                                                        tagInput.trim()
                                                            .length === 0 || // Empty input
                                                        tagInput.trim().length >
                                                            MAX_TAG_LENGTH || // Exceeds max length
                                                        !/^[a-zA-Z0-9]*$/.test(
                                                            tagInput.trim()
                                                        ) // Contains invalid characters
                                                    }
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            {tagInput.trim().length >
                                                MAX_TAG_LENGTH && (
                                                <p className="text-red-500 text-xs">
                                                    Tags cannot exceed{" "}
                                                    {MAX_TAG_LENGTH} characters.
                                                </p>
                                            )}
                                            {tags.length === MAX_TAGS && (
                                                <p className="text-red-500 text-xs">
                                                    Max tags reached.
                                                </p>
                                            )}
                                            {tagInput.trim().length > 0 &&
                                                !/^[a-zA-Z0-9]*$/.test(
                                                    tagInput
                                                ) && (
                                                    <p className="text-red-500 text-xs">
                                                        Tags can only contain
                                                        letters and numbers.
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        {/* Tags Display */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    className="flex items-center space-x-1"
                                                    size={"sm"}
                                                    variant={"default"}
                                                >
                                                    <span
                                                        className="truncate max-w-[80px]"
                                                        title={tag}
                                                    >
                                                        {tag}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                        className="ml-1"
                                                    >
                                                        <XIcon size={14} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Song Art */}
                            <div className="flex justify-center items-center relative">
                                {selectedImage || base64Picture ? (
                                    <img
                                        src={selectedImage || base64Picture} // Update the image source
                                        alt="Playlist Art"
                                        className="w-full h-full max-w-sm max-h-sm object-contain rounded-lg shadow cursor-pointer"
                                        onClick={handleImageSelect} // Handle image selection
                                    />
                                ) : (
                                    <div className="w-full h-full max-w-sm max-h-sm min-h-44 max-h-96 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                                        No Song Art
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-full cursor-pointer">
                                    <EditIcon
                                        size={20}
                                        onClick={handleImageSelect} // Open file dialog on click
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
