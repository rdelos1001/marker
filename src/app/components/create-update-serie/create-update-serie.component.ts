import { Component, Input, OnInit, Sanitizer } from '@angular/core';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ImagePicker, OutputType } from '@ionic-native/image-picker/ngx';
import { ModalController } from '@ionic/angular';
import { Season } from 'src/app/interfaces/season';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-create-update-serie',
  templateUrl: './create-update-serie.component.html',
  styleUrls: ['./create-update-serie.component.scss'],
})
export class CreateUpdateSerieComponent implements OnInit {
  private DEFAULT_IMAGE="/assets/shapes.svg";
  @Input() id_serie:number;

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
  
  ngOnInit() {
    if(this.id_serie){
      this._database.getSerie(this.id_serie).then(async (serie)=>{
        if(serie.image){
          if(serie.image==this.DEFAULT_IMAGE){
            this.imgBase64=this.DEFAULT_IMAGE;
          }else{
            this.lastImagePath=serie.image;
            Filesystem.readFile({
              path:serie.image
            }).then((base64)=>{   
              this.imgBase64='data:image/jpeg;base64,'+base64.data;
            });
          }          
        }     
        this.name=serie.name;
        this.imagePath=serie.image;
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
  chooseImg(){
    this.imagePicker.requestReadPermission().then(async(result)=>{
      if(result=="OK"){
        var imageResult:string[]=await this.imagePicker.getPictures({
          quality:100,
          maximumImagesCount:1,
          outputType:OutputType.DATA_URL
        });        
        this.imgBase64='data:image/jpeg;base64,'+imageResult[0];
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
