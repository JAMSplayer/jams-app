import { Playlist } from "@/types/playlists/playlist";

export const isValidXorname = (input: string): boolean => {
    const regex = /^[a-z0-9]{64}$/;
    return regex.test(input);
};

export const isValidPrivateKey = (input: string): boolean => {
    const regex = /^[0-9a-fA-F]{64}$/;
    return regex.test(input);
};

export function isIDUnique(id: string, playlists: Playlist[]): boolean {
    return !playlists.some((playlist) =>
        playlist.songs?.some((song) => song.id === id)
    );
}
