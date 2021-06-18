import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Season } from 'src/app/interfaces/season';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.page.html',
  styleUrls: ['./season.page.scss'],
})
export class SeasonPage implements OnInit {
  seasonsList:Season[];
  constructor(private activatedRouted:ActivatedRoute,
              private _database:DatabaseService,
              private router:Router) { }

  ngOnInit() {
    let id=parseInt(this.activatedRouted.snapshot.paramMap.get('id_serie'))
    this._database.loadSeasons(id);

    this._database.getSeasons().subscribe((data)=>{     
      if(data && data.length>0 && !this.seasonsList){
        this.seasonsList=data;
        this.seasonsList.sort((a,b)=>b.number-a.number);
      }
    })
    
  }
}
