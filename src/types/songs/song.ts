export type Song = {
    id: string;
    title: string;
    description?: string;
    artist: string;
    artUrl?: string;
    dateCreated: Date;
    dateUpdated?: Date;
    location: string;
    tags: string[];
    xorname: string;
    picture?: string;
    trackNumber?: number;
};
