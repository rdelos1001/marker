import { Season } from "./season";

export interface Episode {
    id:number,
    season:Season,
    name?:string,
    number:number,
    viewed:boolean
}
