import { Song } from "@/types/song";

export type RegisterAccountUser = {
    username: string;
    password: string;
    dateCreated: Date;
    dateUpdated: Date;
};

export type AccountUser = {
    username: string;
    password: string;
    address: string;
    dateCreated: Date;
    dateUpdated: Date;
    songs?: Song[];
};
