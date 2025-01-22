import { Song } from "../songs/song";

export type Playlist = {
    id: string;
    picture?: string;
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    songs?: Song[];
    tags?: string[];
};
