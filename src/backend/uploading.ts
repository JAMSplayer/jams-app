import { SongUpload } from "@/types/songs/song-upload";

export async function UploadSong(song: SongUpload): Promise<boolean> {
    console.log("starting song upload for: ", song);
    await new Promise((resolve) => setTimeout(resolve, 10000));

	// let songXorname = uploadFile(path); // TODO: handle await, null
	// let artXorname = putData(artBytes); // TODO: handle await, null
	// TODO: update song object with songXorname and artXorname, update playlist data, sync with network

    return false;
}
