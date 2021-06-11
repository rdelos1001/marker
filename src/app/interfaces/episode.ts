import { Season } from "./season";

export interface Episode {
    id:number,
    season:Season,
    nombre?:string,
    number:number,
    viewed:boolean
}
