import { useState } from "react";
import Dropzone from "../dropzone";
import { stat } from "@tauri-apps/plugin-fs";
import SingleFilePanel from "./single/single-file-panel";
import MultipleFilePanel from "./multiple/multiple-file-panel";
import { fetchMetadata } from "@/backend/metadata";
import { LocalFileDetail } from "@/types/local-file-detail";
import { extractFromFullPath, generateLocation } from "@/lib/utils/location";
import { base64ToFilePicture } from "@/lib/utils/images";

export default function UploadSongsPanel() {
    const [isDropzoneVisible, setIsDropzoneVisible] = useState(true);
    const [isMultiFile, setIsMultiFile] = useState(false);
    const [fileDetails, setFileDetails] = useState<LocalFileDetail[]>([]);
    const [fileKey, setFileKey] = useState(0); // A key to force re-render
    const [errorMessage, setErrorMessage] = useState("");

    const handleFilesAdded = async (inputtedFilePaths: string[]) => {
        if (inputtedFilePaths.length > 0) {
            // Filter valid files
            const validExtensions = ["mp3", "wav", "ogg"];
            const validFiles = inputtedFilePaths.filter((filePath) => {
                const extension = filePath.split(".").pop()?.toLowerCase();
                return validExtensions.includes(extension || "");
            });

            // Show error message for invalid files
            if (validFiles.length < inputtedFilePaths.length) {
                setErrorMessage(
                    `Some files have invalid extensions. Only the following are allowed: ${validExtensions.join(
                        ", "
                    )}`
                );
            } else {
                setErrorMessage(""); // Clear previous error messages
            }

            if (validFiles.length > 0) {
                setIsMultiFile(validFiles.length > 1);

                const newFileDetails: LocalFileDetail[] = [];
                for (const filePath of validFiles) {
                    const alreadyExists = fileDetails.some(
                        (details) =>
                            generateLocation(
                                "",
                                details.fileName,
                                details.extension,
                                details.folderPath
                            ) === filePath
                    );

                    if (!alreadyExists) {
                        const fileDetail = await createFileDetails(filePath);
                        if (fileDetail) newFileDetails.push(fileDetail);
                    }
                }

                if (newFileDetails.length > 0) {
                    setFileDetails((prev) => [...prev, ...newFileDetails]); // Add new details to existing
                    setFileKey((prevKey) => prevKey + 1); // Update key
                    setIsDropzoneVisible(false); // Hide dropzone
                }
            }
        }
    };

    async function createFileDetails(
        filePath: string
    ): Promise<LocalFileDetail | null> {
        try {
            // Fetch file information

            const fileNameWithExtension = filePath.split("/").pop();
            if (!fileNameWithExtension) return null;

            const information = await stat(filePath);

            // fetch metadata for the file
            const metadata = await fetchMetadata([filePath]);

            // check if metadata is available
            const meta = metadata.length > 0 ? metadata[0] : null;

            if (!meta) {
                console.log("could not get metadata");
                return null;
            }

            const { fileName, extension, folderPath } =
                extractFromFullPath(filePath);

            // proceed with whatever information is available
            return {
                fileName,
                extension,
                folderPath,
                size: information.size,
                title: meta.title,
                artist: meta.artist,
                album: meta.album,
                genre: meta.genre?.toLocaleLowerCase(),
                year: meta.year,
                trackNumber: meta.trackNumber,
                duration: meta.duration,
                channels: meta.channels,
                sampleRate: meta.sampleRate,
                picture: meta.picture
                    ? base64ToFilePicture(meta.picture)
                    : undefined,
            };
        } catch (error) {
            console.error(
                `Error creating file details for ${filePath}:`,
                error
            );
            return null;
        }
    }

    const handleBackToDropzone = () => {
        setIsDropzoneVisible(true);
        setErrorMessage(""); // Clear error
        setFileDetails([]); // Clear selected file details
    };

    return (
        <div className="w-full pb-16">
            {isDropzoneVisible ? (
                <div>
                    <Dropzone onFilesAdded={handleFilesAdded} key={fileKey} />
                    {errorMessage && (
                        <div className="text-red-500 mt-2 text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {fileDetails.length > 0 && (
                        <>
                            {isMultiFile ? (
                                <MultipleFilePanel
                                    onBack={handleBackToDropzone}
                                    fileDetails={fileDetails}
                                />
                            ) : (
                                <SingleFilePanel
                                    onBack={handleBackToDropzone}
                                    fileDetail={fileDetails[0]}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
