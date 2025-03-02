export type FilePicture = {
    data: Uint8Array; // Corresponds to Vec<u8> returned from rust
    mime_type: string; // Corresponds to String returned from rust
};

// this is the file type that we return when querying the network
export type NetworkFileDetail = {
    folderPath: string;
    fileName: string;
    extension: string;
    xorname: string;
    size: number;
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
    trackNumber?: number;
    duration?: number; // duration in seconds
    channels?: number;
    sampleRate?: number;
    picture?: FilePicture;
};
