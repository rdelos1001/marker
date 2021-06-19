import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  pages:any[]=[]
  constructor(private router:Router,
              private _database:DatabaseService) { }

  ngOnInit() {
    this._database.getDatabaseState().subscribe((ready)=>{
      if(ready){
        this._database.loadSeries();
        this._database.getSeries().subscribe((data)=>{
          if(data!=null){
            this.pages=[];
            this.pages.push({
              name:"Configuración",
              path:"configuration"
            })
            data.forEach((s)=>{
              this.pages.push({
                name:s.name,
                path:'season/'+s.id
              })
            })
            this.pages=this.removeDuplicates(this.pages);            
          }
        })
      }
    })
  }
  removeDuplicates(array:any[]){
    const uniqueArray = array.filter((thing, index) => {
      const _thing = JSON.stringify(thing);
      return index === array.findIndex(obj => {
        return JSON.stringify(obj) === _thing;
      });
    });
    return uniqueArray;
  }
  navigate(path:string){    
    this.router.navigate([path])
  }
}
