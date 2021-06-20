import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EditSeasonComponent } from 'src/app/components/edit-season/edit-season.component';
import { Season } from 'src/app/interfaces/season';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.page.html',
  styleUrls: ['./season.page.scss'],
})
export class SeasonPage implements OnInit {
  seasonsList:Season[];
  constructor(private activatedRouted:ActivatedRoute,
              private _database:DatabaseService,
              private _utils:UtilsService,
              private modalController: ModalController) { }
  id_serie:number;
  ngOnInit() {
    this.id_serie=parseInt(this.activatedRouted.snapshot.paramMap.get('id_serie'))    
    this._database.loadSeasons(this.id_serie);

    this._database.getSeasons().subscribe((data)=>{         
      if(data && data.length>0 && data[0].serie.id==this.id_serie){
        this.seasonsList=data;
        this.seasonsList.sort((a,b)=>b.number-a.number);
      }
      console.log("seasonsList-> "+JSON.stringify(this.seasonsList));
      
    })
    
  }
  async edit(season:Season){
    const modal = await this.modalController.create({
    component: EditSeasonComponent,
    componentProps: { 
      id_season: season.id,
      serieName: season.serie.name
    }
    });
  
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log("DATA-> "+JSON.stringify(data));
    
    if(data && data=="delete" && this.seasonsList.length==1 ){
      this._utils.presentAlert("Error","No puedes borrar todas las temporadas");
      return null;
    }else if(data && data=="delete"){
      await this._database.deleteSeason(season.id)

    }else if(data && data!="delete"){
      await this._database.updateSeason(data)
    }
    this._database.loadSeasons(this.id_serie);
  }
}
