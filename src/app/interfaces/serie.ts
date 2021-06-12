import { Saga } from "./saga";

export interface Serie {
    id?:number,
    name:string,
    image?:string,
    state?:string,
    viewed?:boolean,
    webPage?:string
}
