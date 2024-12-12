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
