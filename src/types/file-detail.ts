type FilePicture = {
    data: Uint8Array; // Corresponds to Vec<u8> returned from rust
    mime_type: string; // Corresponds to String returned from rust
};

export type FileDetail = {
    fullPath: string;
    name: string;
    extension: string;
    location: string;
    size: number | null;
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
    trackNumber?: number;
    duration?: number; // Duration in seconds
    channels?: number; // Optional
    sampleRate?: number; // Optional
    picture?: FilePicture;
};
