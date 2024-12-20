import { Song } from "../songs/song";

export type Playlist = {
    id: number;
    picture?: string;
    title: string;
    description?: string;
    artist: string;
    created: Date;
    updated: Date;
    songs: Song[];
};
