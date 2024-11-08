import { Song } from '@/interfaces/index';

export interface User {
  address?: string,
  nickname: string,
  description: string,
  songs: Song[],
  date_created?: Date,
  date_updated?: Date,
}