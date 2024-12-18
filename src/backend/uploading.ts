import { SongUpload } from "@/types/songs/song-upload";

export async function UploadSong(song: SongUpload): Promise<boolean> {
    console.log("starting song upload for: ", song);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return false;
}
