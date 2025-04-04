export type Song = {
    id: string;
    xorname: string;
    title: string;
    artist?: string;
    album?: string;
    genre?: string;
    dateCreated: Date;
    dateUpdated?: Date;
    fileName: string;
    extension: string;
    downloadFolder: string | null;
    tags?: string[];
    picture?: string;
    trackNumber?: number;
    year?: number;
};
