interface Serie_interace {
    id?:number;
    name:string;
    image?:string;
    state?:string;
    webPage?:string;
    equals(otherSerie:Serie):boolean;
}
export class Serie implements Serie_interace{
    id?: number;
    name: string;
    image?: string;
    state?: string;
    webPage?: string;

    constructor(id?:number,name?:string,image?:string,state?:string,webPage?:string){
        if(id)this.id=id;else this.id=null;
        if(name)this.name=name; else this.name=null;
        if(image)this.image=image; else this.image=null;
        if(state)this.state=state; else this.state=null;
        if(webPage)this.webPage=webPage; else this.webPage=null;
    }

    equals(otherSerie:Serie): boolean {        
        if(this.id==otherSerie.id &&
            this.name==otherSerie.name &&
            this.image==otherSerie.image &&
            this.state==otherSerie.state &&
            this.webPage==otherSerie.webPage){
                return true;
            }
        else{
            return false;
        }
    }
    toString(){
        //{"id":20,"name":"00","image":"/assets/shapes.svg","state":"pending","webPage":null}
        return `{"id":${this.id},"name":"${this.name}","image":"${this.image}","state":"${this.state},"webPage":"${this.webPage}"}`
    }
    
}