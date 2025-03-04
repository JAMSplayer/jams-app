export type Song = {
    id: string;
    xorname: string;
    title: string;
    artist: string;
    dateCreated: Date;
    dateUpdated?: Date;
    fileName: string;
    extension: string;
    downloadFolder?: string;
    tags?: string[];
    picture?: string;
    trackNumber?: number;
};
