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
    picture?: string;
};
