import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "gif"];

const extensionToMime: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
};

const convertToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

export const useImageSelector = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageSelect = async (onSelect: (base64: string) => void) => {
        try {
            const selectedFile = await open({
                multiple: false,
                filters: [{ name: "Images", extensions: SUPPORTED_FORMATS }],
            });

            if (!selectedFile) {
                toast("No file selected", {
                    description: "Please select an image.",
                });
                return;
            }

            const fileBuffer = await readFile(selectedFile as string);
            const fileExtension = (selectedFile as string)
                .split(".")
                .pop()
                ?.toLowerCase();

            if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
                toast("Unsupported Format", {
                    description: "Upload JPG, JPEG, PNG, or GIF files only.",
                });
                return;
            }

            const mimeType = extensionToMime[fileExtension];
            const fileBlob = new Blob([new Uint8Array(fileBuffer)], {
                type: mimeType,
            });
            const file = new File([fileBlob], `image.${fileExtension}`);

            if (file.size > MAX_FILE_SIZE) {
                toast("File Too Large", {
                    description: "File exceeds 1MB. Choose a smaller image.",
                });
                return;
            }

            const base64Image = await convertToBase64(fileBlob);
            setSelectedImage(base64Image);
            onSelect(base64Image); // Callback to update parent component
        } catch (error) {
            console.error("Image processing error:", error);
            toast("Image Error", {
                description: "Error processing the selected image.",
            });
        }
    };

    return { selectedImage, handleImageSelect };
};
