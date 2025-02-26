export const generateLocation = (
    xorname: string,
    fileName: string,
    extension: string,
    downloadFolder: string
): string => {
    if (!xorname || !fileName || !extension || !downloadFolder) {
        throw new Error(
            "All parameters (xorname, fileName, extension, downloadFolder) are required."
        );
    }

    const sanitizedFolder = downloadFolder
        .replace(/\\/g, "/")
        .replace(/\/$/, "");

    return `${sanitizedFolder}/${xorname}__${fileName}.${extension}`;
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
