import { Serie } from "./serie";

export interface Season {
    id?:number,
    serie:Serie
    number:number,
    webPage?:string,
    totalEpisodes?:number,
    viewedEpisodes?:number
}