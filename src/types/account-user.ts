import { Song } from "@/types/songs/song";

export type RecoverAccountUser = {
    secretKey: string;
    username: string;
    password: string;
    dateCreated: Date;
    dateUpdated: Date;
};

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
    songs?: Song[];
};

export type SimpleAccountUser = {
    username: string;
    address: string;
};
