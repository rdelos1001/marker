import { Component, Input, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ModalController } from '@ionic/angular';
import { Saga } from 'src/app/interfaces/saga';
import { Serie } from 'src/app/interfaces/serie';
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
  viewed:boolean=false;
  webPage:string;
  constructor(private modalController: ModalController,
              private imagePicker:ImagePicker,
              private _utils:UtilsService) { }
  
  ngOnInit() {
    if(this.serie){
      this.name=this.serie.name;
      this.image=this.serie.image;
      this.state=this.serie.state;
      this.viewed=this.serie.viewed;
      this.webPage=this.serie.webPage;
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
        console.log("IMAGE FILEPATH ->"+ this.image);
        
      })
    })
  }
  cancel(){
    this.modalController.dismiss();
  }
  add(){
    if(this.name && this.name.length>0){
      let data:Serie={
        name:this.name,
        image:this.image,
        state:this.state,
        viewed:this.viewed,
        webPage:this.webPage
      };
      if(this.serie){ data.id=this.serie.id}
      
      this.modalController.dismiss(data)
    }
    else{
      this._utils.presentAlert('ERROR',"Debes rellenar el campo nombre")
    }
  }
  toggleClic(){
    this.viewed=!this.viewed;
  }
}
