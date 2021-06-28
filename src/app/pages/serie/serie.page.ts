import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
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
  serieList:Serie[]=[];
  serie_data:{
    serie:number,
    base64:string,
    nextEpisode:string
  }[]=[];
  @ViewChild(IonInfiniteScroll)infiniteScroll:IonInfiniteScroll;
  constructor(private _database:DatabaseService,
              private modalController: ModalController,
              private _utils:UtilsService) { }

  async ionViewWillEnter(){
    this._database.getDatabaseState().subscribe(async (ready:boolean)=>{
      if(ready && this.serieList.length==0){
        await this._utils.presentLoading("Cargando series...");
        this.serieList= await this._database.getNSeries(0,5);
        if(this.serieList.length>0){
          this.infiniteScroll.disabled=false;
          this.serie_data=[];
          for (const s of this.serieList) {
            let base64= await this.getImageData(s.image);
            let nextEpisode = await this._database.getNextEpisodeSerie(s);
            this.serie_data.push({
              serie:s.id,
              base64,
              nextEpisode
            });
          }
          this._utils.hideLoading();
        }
      }
    })
  }
  async ngOnInit() {
    this._utils.requestFileSystemPermission().then(value=>{
      if(!value){
        this._utils.$filesystemPermision.subscribe((accepted:boolean)=>{
          if(accepted && this.serieList.length>0){
            this.serieList.forEach(async (s)=>{
              var base64= await this.getImageData(s.image);
              this.serie_data.find((sd)=>sd.base64=base64);
            })
          }
        })
      }
    })
  }
  async loadData(event){
    let seriesToShow:Serie[];
    if(this.serieList.length>=5){
      seriesToShow=await this._database.getNSeries(this.serieList.length,3);      
      if(seriesToShow.length==0){
        this.infiniteScroll.disabled=true;
      }else{
        this.serieList.push(...seriesToShow);
        seriesToShow.forEach(async (s)=>{
          let base64= await this.getImageData(s.image);
          let nextEpisode = await this._database.getNextEpisodeSerie(s);
          this.serie_data.push({
            serie:s.id,
            base64,
            nextEpisode
          });
        })
      }
    }
    event.target.complete();
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
        this._utils.hideLoading();
        this.serieList=[]
        this.ionViewWillEnter();
      });
    }
  }
  async edit(originalSerie:Serie){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { id_serie:originalSerie.id }
    });
    
    await modal.present();
    const { data }= await modal.onWillDismiss();

    if(data && !originalSerie.equals(data.serie)){
      await this._utils.presentLoading("Actualizando serie...");
      var updatedSerie = await this._database.updateSerie(data.serie);
      if(data.viewed && updatedSerie.state=="initiated"){
        await this._database.loadSeasons(updatedSerie.id);
        var seasons= this._database.seasons.getValue();
        seasons.sort((a,b)=>b.number-a.number);
        var last_season= seasons[0];
        if(last_season.number==data.viewed.seasonsViewed){
          last_season.viewedEpisodes=data.viewed.episodesViewed;
          last_season.totalEpisodes=data.viewed.episodes_seasons;

        }else if(last_season.viewedEpisodes!=last_season.totalEpisodes){
          last_season.viewedEpisodes=data.viewed.episodes_seasons;
          last_season.totalEpisodes=data.viewed.episodes_seasons;
        }
        await this._database.updateSeason(last_season);
        if(last_season.number!=data.viewed.seasonsViewed){
          for (let i = last_season.number+1; i <= data.viewed.seasonsViewed; i++) {
            
            var seasonCreated:Season={
              number:i,
              serie: updatedSerie,
              totalEpisodes:data.viewed.episodes_seasons,
            }
            if(i == data.viewed.seasonsViewed){
              seasonCreated.viewedEpisodes=data.viewed.episodesViewed;
            }else{
              seasonCreated.viewedEpisodes=data.viewed.episodes_seasons;
            }
            await this._database.addSeason(seasonCreated);
          }
        }
      }
      this.serieList=[];
      this._utils.hideLoading();
      this.ionViewWillEnter();
    }
  }
  async del(serie:Serie){
    if(await this._utils.presentAlertConfirm("Aviso","¿Estas seguro que desea eliminar a "+serie.name+"?")){
      await this._database.deleteSerie(serie.id);
      this.serieList= await this._database.getNSeries(0,5);
      Filesystem.deleteFile({
        path:serie.image
      });
    }
  }
  async getImageData(path:string):Promise<string>{
    if(path=="/assets/shapes.svg"){
      return path;
    }
    var permission=(await Filesystem.checkPermissions()).publicStorage;
    if(permission!="granted"){
      return "/assets/shapes.svg"
    }
    var result = await Filesystem.readFile({
      path
    })
    return 'data:image/jpeg;base64,'+result.data;
  }
  findImage(id:number):string{
    var aux =this.serie_data.find((s)=>s.serie==id)   
    if(aux){
      return aux.base64;
    }else{
      return null;
    }
  }
  findNextEpisode(serie:Serie):string{
    var result = this.serie_data.find((s)=>s.serie==serie.id);
    if(result){
      return result.nextEpisode
    }else{
      return null;
    }
  }
}
