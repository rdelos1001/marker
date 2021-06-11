import { Serie } from "./serie";

export interface Season {
    id:number,
    serie:Serie
    name?:string,
    number:number,
    episodeCount:number,
    viewed:boolean
}
