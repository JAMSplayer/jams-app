import { uploadFile } from "@/backend/autonomi";

export async function uploadSong(
    filePath: string
): Promise<{ success: boolean; songXorname?: string }> {
    console.log("starting song upload for: ", filePath);

    const songXorname = await uploadFile(filePath);

    if (songXorname) {
      return { success: true, songXorname: songXorname };
    } else {
      return { success: false };
    }
}
