import { download } from "@/backend/logic";
import { NetworkFileDetail } from "@/types/network-file-detail";
import { Playlist } from "@/types/playlists/playlist";
import { Song } from "@/types/songs/song";

export async function downloadPlaylist(
    playlist: Playlist
): Promise<NetworkFileDetail[] | null> {
    if (!playlist.songs || playlist.songs.length === 0) {
        console.warn("No songs found in playlist.");
        return null;
    }

    const maxConcurrentDownloads = 5;
    const allSongs = playlist.songs;
    const results: NetworkFileDetail[] = [];

    // function to process a batch of downloads
    const processBatch = async (batch: Song[]) => {
        const batchPromises = batch.map(async (song) => {
            if (!song.xorname) {
                console.warn(
                    `Skipping song "${song.title}" due to missing xorname.`
                );
                return null;
            }
            try {
                let filename = null;
                if (song.fileName && song.extension) {
                    filename = song.fileName + "." + song.extension;
                }
                const downloadedFile = await download(
                    song.xorname,
                    filename
                );
                return downloadedFile;
            } catch (error) {
                console.error(`Error downloading ${song.title}:`, error);
                return null;
            }
        });

        // wait for batch to finish
        const batchResults = await Promise.allSettled(batchPromises);

        // collect successful downloads
        batchResults.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
                results.push(result.value);
            }
        });
    };

    // process in batches of maxConcurrentDownloads
    for (let i = 0; i < allSongs.length; i += maxConcurrentDownloads) {
        const batch = allSongs.slice(i, i + maxConcurrentDownloads);
        await processBatch(batch); // Wait for each batch to finish
    }

    return results;
}
