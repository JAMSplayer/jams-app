export const generateLocation = (
    fileName: string,
    extension: string,
    downloadFolder: string
): string => {
    if (!fileName || !extension || !downloadFolder) {
        throw new Error(
            "All parameters (fileName, extension, downloadFolder) are required."
        );
    }

    const sanitizedFolder = downloadFolder
        .replace(/\\/g, "/")
        .replace(/\/$/, "");

    console.log("download folder: ", downloadFolder);
    console.log("sanatized folder: ", sanitizedFolder);
    console.log("extension: ", extension);
    console.log("fileName: ", fileName);

    return `${sanitizedFolder}/${fileName}.${extension}`;
};

export function extractFromFullPath(fullPath: string): {
    fileName: string;
    extension: string;
    folderPath: string;
} {
    const pathParts = fullPath.split(/[/\\]/);
    const fileNameWithExt = pathParts.pop() || "";
    const folderPath = pathParts.join("/");

    const lastDotIndex = fileNameWithExt.lastIndexOf(".");
    const fileName =
        lastDotIndex !== -1
            ? fileNameWithExt.slice(0, lastDotIndex)
            : fileNameWithExt;
    const extension =
        lastDotIndex !== -1 ? fileNameWithExt.slice(lastDotIndex + 1) : "";

    return { fileName, extension, folderPath };
}
