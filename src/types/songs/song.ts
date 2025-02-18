export type Song = {
    id: string;
    xorname: string;
    title: string;
    description?: string;
    artist: string;
    artUrl?: string;
    dateCreated: Date;
    dateUpdated?: Date;
    fileName: string;
    downloadFolder: string;
    extension: string;
    tags?: string[];
    picture?: string;
    trackNumber?: number;
};
