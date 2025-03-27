import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EditIcon, UploadIcon } from "lucide-react";
import { formatBytes, formatDurationFromSeconds } from "@/lib/utils/formatting";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import SelectYear from "@/components/select-year";
import { saveMetadata } from "@/backend/metadata";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslation } from "react-i18next";
import { singleFileUploadSchema } from "@/form-schemas/single-file-upload-schema";
import { useImageSelector } from "@/hooks/use-image-selector";
import { TagInput } from "../../tag-input";
import { LocalFileDetail } from "@/types/local-file-detail";
import { FilePicture } from "@/types/file-picture";
import { useStorage } from "@/providers/storage-provider";
import { Song } from "@/types/songs/song";
import { uploadSong } from "@/backend/uploading";
import { generateLocation } from "@/lib/utils/location";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NetworkFileDetail } from "@/types/network-file-detail";
import {
    base64ToFilePicture,
    base64ToImageFile,
    filePictureToBase64,
    readToArray,
} from "@/lib/utils/images";
import { toast } from "sonner";

interface SingleFilePanelProps {
    onBack: () => void;
    fileDetail: LocalFileDetail;
}

type FormSchema = z.infer<typeof singleFileUploadSchema>;

export default function SingleFilePanel({
    onBack,
    fileDetail,
}: SingleFilePanelProps) {
    const localSongForm = useForm<FormSchema>({
        resolver: zodResolver(singleFileUploadSchema),
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
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isValid },
    } = localSongForm;

    type singleFileUploadData = z.infer<typeof singleFileUploadSchema>;
    const { t } = useTranslation();
    const { store } = useStorage();

    const [isUploading, setIsUploading] = useState<boolean>(false);

    // Load song metadata and populate form fields and songs ----------------------------------------------------------------

    // this should only happen when the component mounts and the store is present
    useEffect(() => {
        const updateFields = async () => {
            try {
                // tags will be empty as they don't exist on a files metadata
                setValue("tags", []);

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
                setValue(
                    "picture",
                    filePictureToBase64(fileDetail.picture) ?? undefined,
                    {
                        shouldValidate: true,
                    }
                );
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

    const getDefaultDownloadFolder = async () => {
        const folder = await store?.get<{ value: string }>("download-folder");
        return folder?.value || null;
    };

    const createLocalSongFile = (
        data: singleFileUploadData,
        fileDetail: LocalFileDetail
    ): LocalFileDetail => {
        const {
            title,
            artist,
            album,
            genre,
            year,
            trackNumber,
            duration,
            channels,
            sampleRate,
            picture,
        } = data;

        const localSongFile: LocalFileDetail = {
            title,
            artist,
            album,
            genre,
            year,
            trackNumber,
            duration,
            channels,
            sampleRate,
            picture: picture ? base64ToFilePicture(picture) : undefined,
            folderPath: fileDetail.folderPath,
            fileName: fileDetail.fileName,
            extension: fileDetail.extension,
            size: fileDetail.size,
        };

        return localSongFile;
    };

    const onSubmit = async (data: singleFileUploadData) => {
        if (!store) {
            console.error("Store is not initialized.");
            return;
        }

        const defaultDownloadFolder = await getDefaultDownloadFolder();
        if (!defaultDownloadFolder) {
            console.error("No default download folder found.");
            return;
        }

        console.log("Submitted Values:", { ...data });

        try {
            setIsUploading(true);

            const localSongFile = createLocalSongFile(data, fileDetail);

            await saveMetadata(localSongFile);

            const result = await uploadSong(
                generateLocation(
                    localSongFile.fileName,
                    localSongFile.extension,
                    localSongFile.folderPath
                )
            );

            if (!result.success && result.error) {
                console.log("Upload failed due to:", result.error);
                toast(result.error, {
                    description: result.error,
                });
                return;
            }

            console.log("Result of upload: ", result);
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

                <Button
                    size={"sm"}
                    type="submit"
                    form="customizeForm"
                    className="mr-3"
                    disabled={!isValid || isUploading}
                >
                    {isUploading ? (
                        <span className="inline-flex items-center gap-x-2">
                            {"Downloading"}
                            <LoadingSpinner />
                        </span>
                    ) : (
                        <>
                            {t("upload")} <UploadIcon />
                        </>
                    )}
                </Button>
            </div>

            {/* Information Card */}
            <div className="px-4 pt-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">{t("information")}</h1>
                </div>

                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    {fileDetail.fileName && (
                        <p className="text-sm text-gray-500">
                            {t("fileName")}: {fileDetail.fileName}
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
                    <Form {...localSongForm}>
                        <form
                            id="customizeForm"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Form Fields */}
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="w-full">
                                            <FormField
                                                control={localSongForm.control}
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
                                                control={localSongForm.control}
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

                                        {/* Album */}
                                        <div className="w-full">
                                            <FormField
                                                control={localSongForm.control}
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
                                                control={localSongForm.control}
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

                                        {/* Year */}
                                        <div className="w-full">
                                            <SelectYear
                                                register={register}
                                                setValue={setValue}
                                                height="200px"
                                            />
                                        </div>

                                        {/* Track Number */}
                                        <div className="w-full">
                                            <FormField
                                                control={localSongForm.control}
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
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
