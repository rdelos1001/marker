import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Episode } from 'src/app/interfaces/episode';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.page.html',
  styleUrls: ['./episodes.page.scss'],
})
export class EpisodesPage implements OnInit {

  constructor(private actRoute:ActivatedRoute) { }
  episodeList:Episode[]
  
  ngOnInit() {
    let id=parseInt(this.actRoute.snapshot.paramMap.get('id_serie'))
      
  }

}
