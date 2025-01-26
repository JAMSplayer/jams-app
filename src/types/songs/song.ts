export type Song = {
    id: string;
    title: string;
    description?: string;
    artist: string;
    artUrl?: string;
    dateCreated: Date;
    dateUpdated?: Date;
    location: string;
    tags?: string[];
    networkID: string;
    picture: string | undefined;
};
