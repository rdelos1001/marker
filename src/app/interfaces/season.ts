import { Serie } from "./serie";

export interface Season {
    id?:number,
    serie:Serie
    number:number,
    viewed?:boolean,
    totalEpisodes?:number,
    viewedEpisodes?:number
}