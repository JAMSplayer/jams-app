import { FilePicture } from "./file-picture";

// this is the file type when we drag/drop files to upload
export type LocalFileDetail = {
    folderPath: string;
    fileName: string;
    extension: string;
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
