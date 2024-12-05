import { useState } from "react";
import Dropzone from "../dropzone";
import { FileMeta } from "@/types/file-meta";
import { BaseDirectory, stat } from "@tauri-apps/plugin-fs";
import SingleFilePanel from "./single/single-file-panel";
import MultipleFilePanel from "./multiple/multiple-file-panel";

export default function UploadSongsPanel() {
    const [isDropzoneVisible, setIsDropzoneVisible] = useState(true);
    const [isMultiFile, setIsMultiFile] = useState(false);
    const [fileMetas, setFileMetas] = useState<FileMeta[]>([]);
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

                const newFileMetas: FileMeta[] = [];
                for (const filePath of validFiles) {
                    const alreadyExists = fileMetas.some(
                        (meta) => meta.fullPath === filePath
                    );

                    if (!alreadyExists) {
                        const fileMeta = await createFileMetaFromString(
                            filePath
                        );
                        if (fileMeta) newFileMetas.push(fileMeta);
                    }
                }

                if (newFileMetas.length > 0) {
                    setFileMetas([...newFileMetas]); // Replace existing files
                    setFileKey((prevKey) => prevKey + 1); // Update key
                    setIsDropzoneVisible(false); // Hide dropzone
                }
            }
        }
    };

    async function createFileMetaFromString(
        filePath: string
    ): Promise<FileMeta | null> {
        try {
            const location = filePath.substring(0, filePath.lastIndexOf("/"));
            const fileNameWithExtension = filePath.split("/").pop();
            if (!fileNameWithExtension) return null;

            const [name, ...extParts] = fileNameWithExtension.split(".");
            const extension = extParts.join(".");
            const metadata = await stat(filePath, {
                baseDir: BaseDirectory.Download,
            });

            return {
                fullPath: filePath,
                name,
                extension,
                location,
                size: metadata.size,
            };
        } catch (error) {
            console.error("Error creating file meta:", error);
            return null;
        }
    }

    const handleBackToDropzone = () => {
        setIsDropzoneVisible(true);
        setErrorMessage(""); // Clear error
        setFileMetas([]); // Clear selected files
    };

    return (
        <div className="w-full">
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
                    {fileMetas.length > 0 && (
                        <>
                            {isMultiFile ? (
                                <MultipleFilePanel
                                    onBack={handleBackToDropzone}
                                    fileMetas={fileMetas}
                                />
                            ) : (
                                <SingleFilePanel
                                    onBack={handleBackToDropzone}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
