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
