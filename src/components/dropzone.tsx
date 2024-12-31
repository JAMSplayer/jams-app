import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Window } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";

interface DropzoneProps {
    onFilesAdded: (filePaths: string[]) => void;
}

function Dropzone({ onFilesAdded }: DropzoneProps) {
    const { t } = useTranslation();
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [isOverTarget, setIsOverTarget] = useState(false);

    useEffect(() => {
        const currentWindow = Window.getCurrent();

        const handleDragDrop = async (event: any) => {
            if (isOverTarget) {
                setIsOverTarget(false); // Reset to false after handling the drop

                const filePath: string[] = event.payload.paths;

                if (event.payload.paths.length > 0) {
                    onFilesAdded(filePath);
                }
            }
            setIsOverTarget(false);
        };

        const handleDragOver = (event: any) => {
            isOverDropzone(event);
        };

        const isOverDropzone = (event: any) => {
            const rect = dropZoneRef.current?.getBoundingClientRect();

            const clientX = event.payload.position.x;
            const clientY = event.payload.position.y;

            const offset = 33;

            if (
                rect &&
                (clientX < rect.left ||
                    clientX + 1 > rect.right ||
                    clientY < rect.top + offset ||
                    clientY + 1 > rect.bottom + offset)
            ) {
                setIsOverTarget(false);
                return false;
            }
            setIsOverTarget(true);
            return true;
        };

        const unlistenDragDropEvent = currentWindow.listen(
            "tauri://drag-drop",
            handleDragDrop
        );

        const unlistenDragOverEvent = currentWindow.listen(
            "tauri://drag-over",
            handleDragOver
        );

        return () => {
            unlistenDragDropEvent.then((f) => f());
            unlistenDragOverEvent.then((f) => f());
        };
    }, [isOverTarget]);

    // Function to handle file browsing
    const handleBrowseClick = async () => {
        const selectedFiles = await open({
            multiple: true, // Set to true if you want to allow multiple file selection
            directory: false,
            filters: [{ name: "Sound", extensions: ["mp3", "wav", "ogg"] }], // TODO Customize file filters to only allow sound/music files
        });

        if (selectedFiles && selectedFiles.length === 1) {
            // If only one file is selected, send that single file in an array
            onFilesAdded([selectedFiles[0]]);
        } else if (selectedFiles && selectedFiles.length > 1) {
            // If multiple files are selected, send the entire array
            onFilesAdded(selectedFiles);
        }
    };

    return (
        <div>
            <div
                ref={dropZoneRef}
                id="dropzone_area"
                className={`h-52 m-5 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center rounded-lg
                ${
                    isOverTarget
                        ? "bg-secondary animate-pulse"
                        : "bg-transparent"
                } 
                transition duration-200 ease-in-out flex flex-col justify-center items-center`}
                style={{ animationDuration: "1s" }}
            >
                <UploadIcon
                    className="h-8 w-8 mb-2 text-foreground"
                    aria-hidden="true"
                />
                <p className="text-foreground">
                    {t("dragAndDropFilesOr")}{" "}
                    <span
                        className="text-blue-500 underline cursor-pointer"
                        onClick={handleBrowseClick}
                    >
                        {t("browse")}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Dropzone;
