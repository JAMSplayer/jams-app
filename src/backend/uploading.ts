import { uploadFile } from "@/backend/autonomi";
import { Errors } from "@/enums/errors";

export async function uploadSong(
    filePath: string
): Promise<{ success: boolean; songXorname?: string; error?: string }> {
    console.log("starting song upload for: ", filePath);

    try {
        const songXorname = await uploadFile(filePath);
        if (songXorname) {
            return { success: true, songXorname: songXorname };
        } else {
            return { success: false };
        }
    } catch (e: any) {
        let detectedError;

        const errorMessage = e.Common?.toLowerCase().trim().replace(/\.$/, ""); // convert to lowercase and remove trailing period
        if (errorMessage?.includes("error occurred during payment")) {
            detectedError = Errors.PaymentRequired;
        } else {
            detectedError = Errors.UnknownError;
        }
        return { success: false, error: detectedError };
    }
}
