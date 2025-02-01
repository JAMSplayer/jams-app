import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EditIcon, UploadIcon, XIcon } from "lucide-react";
import { FileDetail, FilePicture } from "@/types/file-detail"; // Replace with the actual path for FileMeta type
import { formatBytes, formatDurationFromSeconds } from "@/lib/utils/formatting";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { convertToBase64, base64ToImageFile } from "@/lib/utils/images";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SelectYear from "@/components/select-year";
import { toast } from "sonner";
import { uploadSong } from "@/backend/uploading";
import { saveMetadata } from "@/backend/metadata";
import { SongUpload } from "@/types/songs/song-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslation } from "react-i18next";
import { singleFileUploadSchema } from "@/form-schemas/single-file-upload-schema";

// TODO
// when the file is uploaded successfully, show dialog to allow the user to put it into a playlist.
// also allow the user to create a new playlist in this step for ease of use.
// should the user skip selecting a playlist here, put the file into the general playlist.

// the uploaded file should be downloaded and and moved into location where all the files are located.
// later we can skip the download and just move directly, just need confirm it works.
// when the file is uploaded, return the xorname address of the file on the network to be added to the playlist file.

interface SingleFilePanelProps {
    onBack: () => void;
    fileDetail: FileDetail;
}

type FormSchema = z.infer<typeof singleFileUploadSchema>;

export default function SingleFilePanel({
    onBack,
    fileDetail,
}: SingleFilePanelProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid },
    } = useForm<FormSchema>({
        resolver: zodResolver(singleFileUploadSchema),
        mode: "onChange",
        defaultValues: {
            title: fileDetail.title || "",
            artist: fileDetail.artist || "",
            album: fileDetail.album || "",
            genre: fileDetail.genre || "",
            year: fileDetail.year ?? undefined,
            trackNumber: fileDetail.trackNumber ?? undefined,
            duration: fileDetail.duration ?? undefined,
            channels: fileDetail.channels ?? undefined,
            sampleRate: fileDetail.sampleRate ?? undefined,
            picture: "", // this will be set after base64 conversion
        },
    });

    const { t } = useTranslation();

    const [isUploading, setIsUploading] = useState<boolean>(false);

    // image ----------------------------------------------------------------

    const [base64Picture, setBase64Picture] = useState<string>("");

    // The image the user selects if they wish to change album art
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const setPictureBase64 = async () => {
            if (fileDetail.picture) {
                const pictureBlob = new Blob([fileDetail.picture.data], {
                    type: fileDetail.picture.mime_type,
                });
                const base64Image = await convertToBase64(pictureBlob);
                setBase64Picture(base64Image); // Update state with base64 image
            }
        };
        setPictureBase64();
    }, [fileDetail]);

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
                toast(t("file"), {
                    description: t("noFileSelected"),
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
                toast(t("unsupported"), {
                    description: t("unsupportedFileFormatPleaseUpload"),
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
                toast(t("fileSize"), {
                    description: t("fileSizeExceeds1MB"),
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
            toast(t("errorProcessingImage"), {
                description: t("errorProcessingTheSelectedImage"),
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
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setTags((prevTags) => prevTags.filter((t) => t !== tag));
    };

    // end tags ----------------------------------------------------------------

    // track number ------------------------------------------------------------

    const [trackNumber, setTrackNumber] = useState<number | undefined>(); // Track number state

    // Handle input change and validate the input
    const handleTrackNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;

        // Check if the value is a valid number and has a maximum length of 3 digits
        if (/^\d{0,3}$/.test(value)) {
            setTrackNumber(value ? parseInt(value, 10) : undefined); // Update the state with the value as a number or undefined
            setValue("trackNumber", value ? parseInt(value, 10) : undefined); // Update the form with the parsed number (or undefined if empty)
        }
    };

    // end track number ------------------------------------------------------------

    const onSubmit = async (data: FormSchema) => {
        console.log("Submitted Values:", { ...data, tags });

        const song: SongUpload = { ...data, tags };

        try {
            setIsUploading(true);

            let songFile: FileDetail = {
              ...fileDetail,
              ...song,
            };
            console.log("songFile: ", songFile);

            if (song.picture) {
              const imageFile: File = base64ToImageFile(song.picture, "coverArt");
              const picture: FilePicture = {
                data: imageFile.bytes(),
                mime_type: imageFile.type,
              };
              songFile.picture = picture;
            }
            console.log("songFile: ", songFile);

            await saveMetadata(songFile);

            // TODO: add a playlist to which the song has to be added
            const result = await uploadSong(songFile.fullPath);
            // TODO: update song object with songXorname, update playlist data, sync with network
            console.log("The song has been uploaded: ", result);
        } catch (ex) {
            console.log("The song could not be uploaded: ", ex);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="w-full sticky top-[3.5rem] bg-background z-50 border-b border-t border-secondary p-2 border-l flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Back Button */}
                    <Button variant={"ghost"} onClick={onBack}>
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>

                {isUploading ? (
                    <LoadingSpinner />
                ) : (
                    <Button
                        size={"sm"}
                        type="submit"
                        form="customizeForm"
                        className="mr-3"
                        disabled={!isValid}
                    >
                        {t("upload")} <UploadIcon />
                    </Button>
                )}
            </div>

            {/* Information Card */}
            <div className="px-4 pt-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">{t("information")}</h1>
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    {fileDetail.name && (
                        <p className="text-sm text-gray-500">
                            {t("fileName")}: {fileDetail.name}
                        </p>
                    )}
                    {fileDetail.location && (
                        <p className="text-sm text-gray-500">
                            {t("location")}: {fileDetail.location}
                        </p>
                    )}
                    {fileDetail.size && (
                        <p className="text-sm text-gray-500">
                            {t("size")}: {formatBytes(fileDetail.size)}
                        </p>
                    )}
                    {fileDetail.extension && (
                        <p className="text-sm text-gray-500">
                            {t("extension")}: {fileDetail.extension}
                        </p>
                    )}
                    {fileDetail.duration && fileDetail.duration > 0 && (
                        <p className="text-sm text-gray-500">
                            {t("duration")}:{" "}
                            {formatDurationFromSeconds(fileDetail.duration)}
                        </p>
                    )}
                    {fileDetail.sampleRate && fileDetail.sampleRate > 0 && (
                        <p className="text-sm text-gray-500">
                            {t("sampleRate")}: {fileDetail.sampleRate}
                        </p>
                    )}

                    {fileDetail.channels && fileDetail.channels > 0 && (
                        <p className="text-sm text-gray-500">
                            {t("channels")}: {fileDetail.channels}
                        </p>
                    )}
                </div>
            </div>

            {/* Customize Card */}
            <div className="p-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">{t("customize")}</h1>
                </div>
                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <form id="customizeForm" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Form Fields */}
                            <div className="md:col-span-2">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Title */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">
                                            {t("title")}{" "}
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

                                    {/* Artist */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">
                                            {t("artist")}{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("artist")}
                                            className="w-full border px-2 py-1 rounded"
                                            maxLength={100}
                                        />
                                        {errors.artist && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.artist.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Album */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("album")}
                                        </label>
                                        <input
                                            {...register("album")}
                                            className="w-full border px-2 py-1 rounded"
                                            maxLength={100}
                                        />
                                    </div>

                                    {/* Genre */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("genre")}
                                        </label>
                                        <input
                                            {...register("genre")}
                                            className="w-full border px-2 py-1 rounded"
                                            maxLength={30}
                                        />
                                    </div>

                                    {/* Year */}

                                    <SelectYear
                                        register={register}
                                        setValue={setValue}
                                        height="200px"
                                    />

                                    {/* Track Number */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("trackNumber")}
                                        </label>
                                        <input
                                            type="text"
                                            value={trackNumber || ""} // Ensure it's either a number or empty string
                                            onChange={handleTrackNumberChange} // Update track number
                                            className="w-full border px-2 py-1 rounded"
                                            placeholder={t("enterTrackNumber")}
                                            maxLength={3}
                                        />
                                        {errors.trackNumber && (
                                            <span className="text-red-500 text-sm">
                                                {errors.trackNumber.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tags Input */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("tags")}
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                type="text"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                value={tagInput}
                                                onChange={(e) =>
                                                    setTagInput(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        tagInput.trim()
                                                    ) {
                                                        addTag(e); // Call addTag function when Enter is pressed
                                                    }
                                                }}
                                                placeholder={t("addATag")}
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
                                                    tags.length >= MAX_TAGS || // Max tags reached
                                                    tagInput.trim().length ===
                                                        0 || // Empty input
                                                    tagInput.trim().length >
                                                        MAX_TAG_LENGTH || // Exceeds max length
                                                    !/^[a-zA-Z0-9]*$/.test(
                                                        tagInput.trim()
                                                    ) // Contains invalid characters
                                                }
                                            >
                                                {t("add")}
                                            </Button>
                                        </div>
                                        {tagInput.trim().length >
                                            MAX_TAG_LENGTH && (
                                            <p className="text-red-500 text-xs">
                                                {t("tagsCannotExceed")}{" "}
                                                {MAX_TAG_LENGTH}{" "}
                                                {t("characters")}.
                                            </p>
                                        )}
                                        {tags.length === MAX_TAGS && (
                                            <p className="text-red-500 text-xs">
                                                {t("maxTagsReached")}.
                                            </p>
                                        )}
                                        {tagInput.trim().length > 0 &&
                                            !/^[a-zA-Z0-9]*$/.test(
                                                tagInput
                                            ) && (
                                                <p className="text-red-500 text-xs">
                                                    {t(
                                                        "tagsCanOnlyContainLettersAndNumbers"
                                                    )}
                                                    .
                                                </p>
                                            )}
                                    </div>

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

                            {/* Album Art */}
                            <div className="flex justify-center items-center relative">
                                {selectedImage || base64Picture ? (
                                    <img
                                        src={selectedImage || base64Picture} // Update the image source
                                        alt="Album Art"
                                        className="w-full h-full max-w-sm max-h-sm object-contain rounded-lg shadow cursor-pointer"
                                        onClick={handleImageSelect} // Handle image selection
                                    />
                                ) : (
                                    <div className="w-full h-full max-w-sm max-h-sm flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                                        {t("noAlbumArt")}
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
                </div>
            </div>
        </div>
    );
}
