export type SongUpload = {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    year?: number;
    trackNumber?: number;
    duration?: number;
    channels?: number;
    sampleRate?: number;
    picture?: string;
    tags?: string[];
};
