// metadata.ts
import { FileDetail } from "@/types/file-detail";
import { invoke } from "@tauri-apps/api/core";

export async function fetchMetadata(
    filePaths: string[]
): Promise<FileDetail[]> {
    try {
        // Fetch metadata for all files
        const metadata: FileDetail[] = await invoke("get_file_metadata", {
            filePaths,
        });
        return metadata;
    } catch (error) {
        console.error("Failed to fetch metadata for files:", filePaths, error);
        return []; // Return an empty array to avoid breaking the flow
    }
}

export async function readMetadata(
    locationPath: string // like 08dbb205f5a5712e48551c0e437f07be304a5daadf20e07e8307e7f564fa9962__BegBlag.mp3
): Promise<FileDetail | null> {
    try {
        // Fetch metadata for all files
        const metadata: FileDetail = await invoke("read_metadata", {
            locationPath,
        });
        return metadata;
    } catch (error) {
        console.error("Failed to fetch metadata from network: ", locationPath, error);
    }
    return null;
}
