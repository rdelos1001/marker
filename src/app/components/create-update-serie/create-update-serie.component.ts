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

  @Input() serie:Serie;

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
  
  async ngOnInit() {
    if(this.serie){
      this.name=this.serie.name;
      this.image=this.serie.image;
      this.state=this.serie.state;
      this.webPage=this.serie.webPage;
      await this._database.loadSeasons(this.serie.id);
      this._database.getSeasons().subscribe(data=>{
        this.seasonsList=data;        
        this.episodes_seasons=data[data.length-1].totalEpisodes;
        this.episodesViewed  =data[data.length-1].viewedEpisodes;
        this.seasonsViewed   =data[data.length-1].number;
      });
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
      let data:any={
        serie:{
          name:this.name,
          image:this.image,
          state:this.state,
          webPage:this.webPage
        },
        viewed:{
          seasonsViewed:this.seasonsViewed,
          episodesViewed:this.episodesViewed,
          episodes_seasons:this.episodes_seasons
        }
      };
      if(this.serie){ data.serie.id=this.serie.id}
      
      this.modalController.dismiss(data)
    }
    else{
      this._utils.presentAlert('ERROR',"Debes rellenar el campo nombre")
    }
  }
}
