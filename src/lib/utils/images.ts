import { FilePicture } from "@/types/file-picture";

export const convertToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const base64ToImageFile = (
    base64String: string,
    fileName: string
): File => {
    // Remove the Base64 prefix if it exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const mimeTypeMatch = base64String.match(/^data:(image\/\w+);base64,/);

    if (!mimeTypeMatch) {
        throw new Error("Invalid Base64 string: MIME type not found");
    }

    const mimeType = mimeTypeMatch[1]; // Extract MIME type

    // Decode Base64 into a binary array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length)
        .fill(null)
        .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob
    const blob = new Blob([byteArray], { type: mimeType });

    // Convert Blob to File
    return new File([blob], fileName, { type: mimeType });
};

export const base64ToFilePicture = (base64String: string): FilePicture => {
    // Remove the Base64 prefix if it exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const mimeTypeMatch = base64String.match(/^data:(image\/\w+);base64,/);

    if (!mimeTypeMatch) {
        throw new Error("Invalid Base64 string: MIME type not found");
    }

    const mimeType = mimeTypeMatch[1]; // Extract MIME type

    // Decode Base64 into a binary array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length)
        .fill(null)
        .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Return a FilePicture object
    return {
        data: byteArray,
        mime_type: mimeType,
    };
};

export function filePictureToDataURL(
    filePicture: FilePicture | null
): string | null {
    if (!filePicture || !filePicture.data || filePicture.data.length === 0) {
        return null; // Return null if no valid image data
    }

    try {
        const binaryString = new Uint8Array(filePicture.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        const base64String = btoa(binaryString);
        return `data:${filePicture.mime_type};base64,${base64String}`;
    } catch (error) {
        console.error("Invalid image data:", error);
        return null; // return null if there's an error
    }
}
