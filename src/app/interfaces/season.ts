import { Serie } from "./serie";

export interface Season {
    id?:number,
    serie:Serie
    number:number,
    totalEpisodes?:number,
    viewedEpisodes?:number
}