import { SongUpload } from "@/types/songs/song-upload";
import {
    uploadFile,
    putData,
} from "@/backend/autonomi";

export async function uploadSong(
    song: SongUpload,
    filePath: string
): Promise<{ success: boolean; songXorname?: string; artXorname?: string }> {
    console.log("starting song upload for: ", song);

    const songXorname = await uploadFile(filePath);
    let artXorname = null;
    if (song.picture) {
      artXorname = songXorname && await putData(Uint8Array.fromBase64(song.picture));
    }

    if (songXorname) {
      return { true, songXorname, artXorname };
    } else {
      return { false };
    }
}
