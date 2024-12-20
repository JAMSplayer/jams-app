import { Playlist } from "./playlists/playlist";

export type RegisterAccountUser = {
    username: string;
    password: string;
    dateCreated: Date;
    dateUpdated: Date;
};

export type AccountUser = {
    username: string;
    address: string;
    dateCreated: Date;
    dateUpdated: Date;
    playlists?: Playlist[];
};

export type SimpleAccountUser = {
    username: string;
    address: string;
};
