import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EditIcon, UploadIcon, XIcon } from "lucide-react";
import { FileDetail } from "@/types/file-detail"; // Replace with the actual path for FileMeta type
import { formatBytes, formatDurationFromSeconds } from "@/lib/utils/formatting";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import SelectYear from "@/components/select-year";
import { UploadSong } from "@/backend/uploading";
import { SongUpload } from "@/types/songs/song-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslation } from "react-i18next";
import { singleFileUploadSchema } from "@/form-schemas/single-file-upload-schema";
import { useImageSelector } from "@/hooks/use-image-selector";
import { TagInput } from "../../tag-input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

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
        getValues,
        watch,
        formState: { errors, isValid },
    } = useForm<FormSchema>({
        resolver: zodResolver(singleFileUploadSchema),
        mode: "onBlur",
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
            tags: [],
        },
    });

    const watchedTags = watch("tags", []);

    const { t } = useTranslation();

    const [isUploading, setIsUploading] = useState<boolean>(false);

    // image ----------------------------------------------------------------

    const { selectedImage, handleImageSelect } = useImageSelector();

    const handleImageUpload = () => {
        handleImageSelect((base64Image) => {
            setValue("picture", base64Image);
        });
    };

    // end image ----------------------------------------------------------------

    // track number ------------------------------------------------------------

    // end track number ------------------------------------------------------------

    const onSubmit = async (data: FormSchema) => {
        console.log("Submitted Values:", { ...data });

        const song: SongUpload = { ...data };

        try {
            setIsUploading(true);
            const result = await UploadSong(song);
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
                                            type="number"
                                            {...register("trackNumber")}
                                            className="w-full border px-2 py-1 rounded"
                                            placeholder={t("enterTrackNumber")}
                                        />

                                        {errors.trackNumber && (
                                            <span className="text-red-500 text-sm">
                                                {errors.trackNumber.message}
                                            </span>
                                        )}
                                    </div>

                                    <TagInput
                                        initialTags={watchedTags} // Use watched value instead of getValues
                                        onChange={(updatedTags) => {
                                            setValue("tags", updatedTags, {
                                                shouldValidate: true,
                                            }); // Update form state
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Album Art */}
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
                </div>
            </div>
        </div>
    );
}
