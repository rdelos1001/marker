import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CreateUpdateSerieComponent } from 'src/app/components/create-update-serie/create-update-serie.component';
import { Season } from 'src/app/interfaces/season';
import { Serie } from 'src/app/interfaces/serie';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-serie',
  templateUrl: './serie.page.html',
  styleUrls: ['./serie.page.scss'],
})
export class SeriePage implements OnInit {
  filterSerie:string="";
  serieList:Serie[];
  constructor(private _database:DatabaseService,
              private modalController: ModalController,
              private router:Router,
              private _utils:UtilsService) { }

  ngOnInit() {
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        this._database.loadSeries();
        this._database.getSeries().subscribe((data)=>{
          this.serieList=data;
        })
      }
    })
  }
  async addSerie(){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { }
    });
    await modal.present();
    const { data }= await modal.onWillDismiss();
    
    if(data){
      this._utils.presentLoading('Generando serie ...');
      var serie=await this._database.addSerie(data.serie);      
      if(data.viewed.seasonsViewed && data.viewed.episodes_seasons && data.viewed.episodesViewed){
        for (let i = 1; i <= data.viewed.seasonsViewed; i++) {
          var seasonViewed=i<data.viewed.seasonsViewed;
          var totalEpisodes=data.viewed.episodes_seasons;
          var viewedEpisodes=seasonViewed?totalEpisodes:data.viewed.episodesViewed;
          await this._database.addSeason({
            serie,
            number:i,
            viewed:seasonViewed,
            totalEpisodes,
            viewedEpisodes
          })
        }
      }else{
        var season=await this._database.addSeason({
          number:1,
          serie,
          viewed:false,
          totalEpisodes:1,
          viewedEpisodes:0
        })
      }
      this._utils.hideLoading();
    }
  }
  async edit(serie:Serie){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { serie }
    });
    
    await modal.present();
    const { data }= await modal.onWillDismiss();
    if(data){
      this._utils.presentLoading("Actualizando serie...")
      this._database.updateSerie(data.serie);
      var seasons = await this._database.loadSeasons(data.serie.id);
      this._utils.hideLoading();
    }
  }
  del(serie:Serie){
    this._database.deleteSerie(serie.id);
  }
  inspect(serie:Serie){
    this.router.navigate(['/season',serie.id])
  }
}
