import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Filesystem } from '@capacitor/filesystem';
import { IonFab, ModalController } from '@ionic/angular';
import { CreateUpdateSerieComponent } from 'src/app/components/create-update-serie/create-update-serie.component';
import { Season } from 'src/app/interfaces/season';
import { Serie } from 'src/app/interfaces/serie';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-serie',
  templateUrl: './serie.page.html',
  styleUrls: ['./serie.page.scss'],
})
export class SeriePage implements OnInit {
  @ViewChildren("iFabs") iFabs:QueryList<IonFab>;
  filterSerie:string="";
  serieList:Serie[];
  serie_data:{
    serie:number,
    base64:string,
    nextEpisode:string
  }[]=[]
  constructor(private _database:DatabaseService,
              private modalController: ModalController,
              private router:Router,
              private _utils:UtilsService,
              private statusBar: StatusBar) { }

  ngOnInit() {
    this.statusBar.backgroundColorByHexString("#3880ff")
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        this._database.loadSeries();
        this._database.getSeries().subscribe(async (data)=>{
          if(data){
            this.serie_data=[];
            for (const s of data) {
              let base64= await this.getImageData(s.image);
              let nextEpisode = await this._database.getNextEpisodeSerie(s);
              this.serie_data.push({
                serie:s.id,
                base64,
                nextEpisode
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
          await this._database.addSeason({
            number:1,
            serie,
            totalEpisodes:1,
            viewedEpisodes:0
          })
        }
        this._utils.presentToast("Serie creada correctamente")
      })
      .catch((err)=>{
        this._utils.presentAlert("Error","La serie ya existe");
      })
      .finally(async ()=>{
        await this._database.loadSeries();
        this._utils.hideLoading();
      });
    }
  }
  async edit(serie:Serie){
    this.closeFabs();
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { id_serie:serie.id }
    });
    
    await modal.present();
    const { data }= await modal.onWillDismiss();
    if(data){
      await this._utils.presentLoading("Actualizando serie...");
      serie = await this._database.updateSerie(data.serie);
      if(data.viewed && data.serie.state=="initiated"){
        await this._database.loadSeasons(data.serie.id);
        var seasons= this._database.seasons.getValue();
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
        await this._database.updateSeason(season)
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
          await this._database.addSeason(season)
        }
      }

      await this._database.loadSeries();
      this._utils.hideLoading();
    }
  }
  async del(serie:Serie){
    this.closeFabs();
    var { role }=await this._utils.presentAlertConfirm("Aviso","¿Estas seguro que desea eliminar a "+serie.name+"?");
    if(role=="ok"){
      await this._database.deleteSerie(serie.id);
      this._database.loadSeries();
      Filesystem.deleteFile({
        path:serie.image
      });
    }
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
    var aux =this.serie_data.find((s)=>s.serie==id)    
    return aux.base64;
  }
  findNextEpisode(serie:Serie):string{
    return this.serie_data.find((s)=>s.serie==serie.id).nextEpisode;
  }
  closeFabs(){
    this.iFabs.forEach((fab)=>{
      if(fab.activated){
        fab.close();
      }
    })
  }
}
