import { Component, Input, OnInit, Sanitizer, ViewChild } from '@angular/core';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ImagePicker, OutputType } from '@ionic-native/image-picker/ngx';
import { IonInput, ModalController } from '@ionic/angular';
import { Season } from 'src/app/interfaces/season';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Filesystem } from '@capacitor/filesystem';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-update-serie',
  templateUrl: './create-update-serie.component.html',
  styleUrls: ['./create-update-serie.component.scss'],
})
export class CreateUpdateSerieComponent implements OnInit {
  private DEFAULT_IMAGE="/assets/shapes.svg";
  @Input() id_serie:number;
  @ViewChild("inputName")inputName:IonInput;
  name:string;
  imagePath:string=null;
  imgBase64:string;
  lastImagePath:string=this.DEFAULT_IMAGE;
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
    if(this.id_serie){
      await this._utils.presentLoading("Cargando datos...");
      this._database.getSerie(this.id_serie).then(async (serie)=>{        
        if(serie.image){
          if(serie.image==this.DEFAULT_IMAGE){
            this.imgBase64=this.DEFAULT_IMAGE;
          }else{
            this.lastImagePath=serie.image;
            Filesystem.checkPermissions().then((value)=>{
              if(value.publicStorage=="granted"){
                Filesystem.readFile({
                  path:serie.image
                }).then((base64)=>{   
                  this.imgBase64='data:image/jpeg;base64,'+base64.data;
                });
              }
            })
          }          
        }     
        this.name=serie.name;
        this.imagePath=serie.image;
        this.state=serie.state;
        this.webPage=serie.webPage;
        await this._database.loadSeasons(serie.id);
        var data = await this._database.seasons.getValue();
        data.sort((a,b)=>b.number-a.number);
        this.seasonsList=data;        
        this.episodes_seasons=data[0].totalEpisodes;
        this.episodesViewed  =data[0].viewedEpisodes;
        this.seasonsViewed   =data[0].number;
      })
      this._utils.hideLoading();
    }else{
      this.state='pending';
      this.imgBase64=this.DEFAULT_IMAGE
    }
  }
  verify(){
    this.seasonsViewed= this.seasonsViewed<this.seasonsList.length? this.seasonsList.length:Number.parseInt(this.seasonsViewed+"");
    this.episodesViewed=this.episodesViewed<0?0:Number.parseInt(this.episodesViewed+"");
    this.episodes_seasons=this.episodes_seasons<0?0:Number.parseInt(this.episodes_seasons+"");
    if(this.episodesViewed>this.episodes_seasons){
      this.episodes_seasons=this.episodesViewed;
    }
  }
  async chooseImg(){
    this._utils.requestFileSystemPermission().then(async (value)=>{
      if(value){
        var imageResult:string[]=await this.imagePicker.getPictures({
          quality:100,
          maximumImagesCount:1,
          outputType:OutputType.DATA_URL
        });
        if(imageResult[0] && imageResult[0].length>1)this.imgBase64='data:image/jpeg;base64,'+imageResult[0];      
      }
    })
  }
  
  cancel(){
    this.modalController.dismiss();
  }
  async add(){
    if(this.name && this.name.length>0){
      if(this.imgBase64 && this.imgBase64!=this.DEFAULT_IMAGE){
        var permissionStatus =await Filesystem.requestPermissions();
        if(permissionStatus.publicStorage=="granted"){
          var hoy=new Date();
          var hoyStr:string=""+ hoy.getSeconds() + hoy.getMinutes() + hoy.getHours() + hoy.getDate() + hoy.getMonth() + hoy.getFullYear();
          this.imagePath=`file:///storage/emulated/0/Marker/${hoyStr}.jpg`;
          Filesystem.writeFile({
            data:this.imgBase64,
            path:this.imagePath,
            recursive:true
          })
          if(this.lastImagePath!=this.DEFAULT_IMAGE){
            Filesystem.deleteFile({
              path:this.lastImagePath
            })
          }
        }
      }
      let data:any={};
      data.serie={
        name:this.name,
        image:this.imagePath,
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
