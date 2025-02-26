export type Song = {
    id: string;
    xorname: string;
    location: string;

    title: string;
    artist: string;
    trackNumber?: number;
    picture?: string;
    tags?: string[];

    description?: string;

    dateCreated: Date;
    dateUpdated?: Date;
};
