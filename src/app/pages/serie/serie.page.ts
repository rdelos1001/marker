import { Component, OnInit } from '@angular/core';
import { Serie } from 'src/app/interfaces/serie';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-serie',
  templateUrl: './serie.page.html',
  styleUrls: ['./serie.page.scss'],
})
export class SeriePage implements OnInit {

  serieList:Serie[];
  constructor(private _database:DatabaseService) { }

  ngOnInit() {
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        
      }
    })
  }

  getSerie(){}
}
