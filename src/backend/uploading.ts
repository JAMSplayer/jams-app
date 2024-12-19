import { SongUpload } from "@/types/songs/song-upload";

export async function UploadSong(
    song: SongUpload
): Promise<{ success: boolean; xorname?: string }> {
    console.log("starting song upload for: ", song);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const success = false;
    const xorname = "xorname-here";
    return { success, xorname };
}
