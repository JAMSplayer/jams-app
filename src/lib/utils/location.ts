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

    console.log("Download Folder:", downloadFolder);
    console.log("Extension:", extension);
    console.log("File Name:", fileName);

    const localHost = "http://localhost:1420";
    // encode the file name and ensure no double slashes
    const safeFileName = encodeURIComponent(fileName.trim());
    const safeExtension = encodeURIComponent(extension.trim());
    const safeDownloadFolder = downloadFolder.replace(/\/+$/, ""); // remove trailing slashes

    const url = `${localHost}${safeDownloadFolder}/${safeFileName}.${safeExtension}`;

    console.log("URL: ", url);

    return url;
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
