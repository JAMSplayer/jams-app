// metadata.ts
import { LocalFileDetail } from "@/types/local-file-detail";
import { NetworkFileDetail } from "@/types/network-file-detail";
import { invoke } from "@tauri-apps/api/core";

export async function fetchMetadata(
    filePaths: string[]
): Promise<NetworkFileDetail[]> {
    try {
        // Fetch metadata for all files
        const metadata: NetworkFileDetail[] = await invoke(
            "get_file_metadata",
            {
                filePaths,
            }
        );
        return metadata;
    } catch (error) {
        console.error("Failed to fetch metadata for files:", filePaths, error);
        return []; // Return an empty array to avoid breaking the flow
    }
}

export async function saveMetadata(file: LocalFileDetail): Promise<void> {
    // throw on error
    await invoke("save_file_metadata", { songFile: file });
}
