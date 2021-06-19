import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Filesystem } from '@capacitor/filesystem';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
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
  serie_base64:{
    serie:number,
    base64:string
  }[]=[]
  constructor(private _database:DatabaseService,
              private modalController: ModalController,
              private router:Router,
              private _utils:UtilsService) { }

  ngOnInit() {
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        this._database.loadSeries();
        this._database.getSeries().subscribe(async (data)=>{
          if(data){
            for (const s of data) { 
              let base64= await this.getImageData(s.image);
              this.serie_base64.push({
                serie:s.id,
                base64
              });
            }
            this.serieList=data;
            //NO SE COMO VA PERO ORDENA ALFABETICAMENTE
            this.serieList.sort(function(a,b){
              var textA = a.state.toLowerCase();
              var textB = b.state.toLowerCase();
              return (textA < textB)?-1:(textA> textB) ? 1:0;
            });
          }
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
      await this._utils.presentLoading('Generando serie ...');
      await this._database.addSerie(data.serie)
      .then(async (serie)=>{
        if(data.viewed){
          for (let i = 1; i <= data.viewed.seasonsViewed; i++) {
            var seasonViewed=i<data.viewed.seasonsViewed;
            var totalEpisodes=data.viewed.episodes_seasons;
            var viewedEpisodes=seasonViewed?totalEpisodes:data.viewed.episodesViewed;
            await this._database.addSeason({
              serie,
              number:i,
              totalEpisodes,
              viewedEpisodes
            })
          }
        }else{
          var season=await this._database.addSeason({
            number:1,
            serie,
            totalEpisodes:1,
            viewedEpisodes:0
          })
        }
      })
      .catch((err)=>{
        this._utils.presentAlert("Error","La serie ya existe");
      })
      .finally(()=>{
        this._database.loadSeries();
        this._utils.hideLoading();
      });      
    }
  }
  async edit(serie:Serie){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { id_serie:serie.id }
    });
    
    await modal.present();
    const { data }= await modal.onWillDismiss();
    if(data){
      await this._utils.presentLoading("Actualizando serie...");
      let serieIndex=this.serieList.findIndex((s)=>s==serie);
      serie = await this._database.updateSerie(data.serie);
      await this._database.loadSeasons(data.serie.id);
      var seasons= this._database.seasons.getValue();
      if(data.viewed && data.serie.state=="initiated"){
        var season= seasons[seasons.length-1]
        if(seasons[seasons.length-1].number==data.viewed.seasonsViewed){
          season.viewedEpisodes=data.viewed.episodesViewed;
          season.totalEpisodes=data.viewed.episodes_seasons;
        }else{
          if(season.viewedEpisodes!=season.totalEpisodes){
            season.viewedEpisodes=data.viewed.episodes_seasons;
            season.totalEpisodes=data.viewed.episodes_seasons;
          }
        }
        this._database.updateSeason(season)
        for (let i = seasons[seasons.length-1].number+1; i <= data.viewed.seasonsViewed; i++) {
          var season:Season={
            number:i,
            serie,
            totalEpisodes:data.viewed.episodes_seasons,
          }
          if(i == data.viewed.seasonsViewed){
            season.viewedEpisodes=data.viewed.episodesViewed;
          }else{
            season.viewedEpisodes=data.viewed.episodes_seasons;
          }
          this._database.addSeason(season)
        }
      }
      this.serieList[serieIndex]=serie;
      this._database.loadSeasons(serie.id)
      this._utils.hideLoading();
    }
  }
  async del(serie:Serie){
    var { role }=await this._utils.presentAlertConfirm("Aviso","¿Estas seguro que desea eliminar a "+serie.name+"?");
    if(role=="ok"){
      this._database.deleteSerie(serie.id);
    }
  }
  inspect(serie:Serie){
    this.router.navigate(['/season',serie.id])
  }
  async getImageData(path:string):Promise<string>{
    if(path=="/assets/shapes.svg"){
      return "/assets/shapes.svg";
    }
    var result = await Filesystem.readFile({
      path
    })
    return 'data:image/jpeg;base64,'+result.data;
  }
  findImage(id:number){
    var aux =this.serie_base64.find((s)=>s.serie==id)
    console.log(JSON.stringify(aux));
    
    return aux.base64;
  }
}
