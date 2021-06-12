import { Saga } from "./saga";

export interface Serie {
    id:number,
    saga?:Saga,
    name:string,
    image?:string,
    state?:string,
    viewed?:boolean,
    webPage?:string
}
