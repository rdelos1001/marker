import { Component, Input, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ModalController } from '@ionic/angular';
import { Saga } from 'src/app/interfaces/saga';
import { UtilsService } from 'src/app/services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-create-saga',
  templateUrl: './create-update-saga.component.html',
  styleUrls: ['./create-update-saga.component.scss'],
})
export class CreateSagaComponent implements OnInit {
  id:number;
  name:string="";
  seriesCount:number;
  image:string;
  @Input() saga:Saga;
  constructor(private modalController: ModalController,
              private imagePicker:ImagePicker,
              private _utils:UtilsService,
              private DomSanitizer: DomSanitizer) { }

  ngOnInit() {
    if(this.saga){
      this.name=this.saga.name;
      this.image=this.saga.image;
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
      let data:Saga={
        name:this.name,
        image:this.image
      };
      if(this.saga){ data.id=this.saga.id}
      
      this.modalController.dismiss(data)
    }
    else{
      this._utils.presentAlert('ERROR',"Debes rellenar el campo nombre")
    }
  }
}
