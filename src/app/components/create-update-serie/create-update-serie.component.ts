import { Component, Input, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ModalController } from '@ionic/angular';
import { Saga } from 'src/app/interfaces/saga';
import { Season } from 'src/app/interfaces/season';
import { Serie } from 'src/app/interfaces/serie';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-create-update-serie',
  templateUrl: './create-update-serie.component.html',
  styleUrls: ['./create-update-serie.component.scss'],
})
export class CreateUpdateSerieComponent implements OnInit {

  @Input() id_serie:number;

  name:string;
  image:string;
  state:string;
  webPage:string;
  seasonsList:Season[];
  episodes_seasons:number=null;
  episodesViewed:number=null;
  seasonsViewed:number=null;
  constructor(private modalController: ModalController,
              private imagePicker:ImagePicker,
              private _utils:UtilsService,
              private _database:DatabaseService) { }
  
  ngOnInit() {
    if(this.id_serie){
      this._database.getSerie(this.id_serie).then(async (serie)=>{
        console.log(JSON.stringify(serie));
        
        this.name=serie.name;
        this.image=serie.image;
        this.state=serie.state;
        this.webPage=serie.webPage;
        await this._database.loadSeasons(serie.id);
        this._database.getSeasons().subscribe(data=>{
          this.seasonsList=data;        
          this.episodes_seasons=data[data.length-1].totalEpisodes;
          this.episodesViewed  =data[data.length-1].viewedEpisodes;
          this.seasonsViewed   =data[data.length-1].number;
        });
      })
    }else{
      this.state='pending'
    }
  }
  chooseImg(){
    this.imagePicker.hasReadPermission().then(async(result)=>{
      
      if(!result){
        await this.imagePicker.requestReadPermission();
      }
      
      this.imagePicker.getPictures({
        maximumImagesCount:1,
        quality:100
      }).then((value)=>{
        this.image= value        
      })
    })
  }
  cancel(){
    this.modalController.dismiss();
  }
  add(){
    if(this.name && this.name.length>0){
      let data:any={}
      data.serie={
        name:this.name,
        image:this.image,
        state:this.state,
        webPage:this.webPage
      };
      if(this.seasonsViewed && this.episodesViewed && this.episodes_seasons){
        data.viewed={
          seasonsViewed:this.seasonsViewed,
          episodesViewed:this.episodesViewed,
          episodes_seasons:this.episodes_seasons
        }
      }
      if(this.id_serie){ data.serie.id=this.id_serie}
      
      this.modalController.dismiss(data)
    }
    else{
      this._utils.presentAlert('ERROR',"Debes rellenar el campo nombre")
    }
  }
}
