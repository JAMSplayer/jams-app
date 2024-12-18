import { useState } from "react";
import Dropzone from "../dropzone";
import { FileDetail } from "@/types/file-detail";
import { BaseDirectory, stat } from "@tauri-apps/plugin-fs";
import SingleFilePanel from "./single/single-file-panel";
import MultipleFilePanel from "./multiple/multiple-file-panel";
import { fetchMetadata } from "@/backend/metadata";

export default function UploadSongsPanel() {
    const [isDropzoneVisible, setIsDropzoneVisible] = useState(true);
    const [isMultiFile, setIsMultiFile] = useState(false);
    const [fileDetails, setFileDetails] = useState<FileDetail[]>([]);
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

                const newFileDetails: FileDetail[] = [];
                for (const filePath of validFiles) {
                    const alreadyExists = fileDetails.some(
                        (details) => details.fullPath === filePath
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
    ): Promise<FileDetail | null> {
        try {
            // Fetch file information
            const location = filePath.substring(0, filePath.lastIndexOf("/"));
            const fileNameWithExtension = filePath.split("/").pop();
            if (!fileNameWithExtension) return null;

            const [name, ...extParts] = fileNameWithExtension.split(".");
            const extension = extParts.join(".");
            const information = await stat(filePath, {
                baseDir: BaseDirectory.Download,
            });

            // Fetch metadata for the file
            const metadata = await fetchMetadata([filePath]);

            // Check if metadata is available
            const meta = metadata.length > 0 ? metadata[0] : null;

            if (meta?.picture) {
                console.log("data", Buffer.from(meta.picture.data));
                console.log("mime", meta.picture.mime_type);
            }
            console.log("test: ", meta?.year);
            // Proceed with whatever information is available
            return {
                fullPath: filePath,
                name,
                extension,
                location,
                size: information.size,
                title: meta?.title,
                artist: meta?.artist,
                album: meta?.album,
                genre: meta?.genre?.toLocaleLowerCase(),
                year: meta?.year,
                trackNumber: meta?.trackNumber,
                duration: meta?.duration,
                channels: meta?.channels,
                sampleRate: meta?.sampleRate,
                picture: meta?.picture // test if either data or mime_type is undefined that picture is set to undefined
                    ? {
                          data: new Uint8Array(meta.picture.data),
                          mime_type: meta.picture.mime_type,
                      }
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
