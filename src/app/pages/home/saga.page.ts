import { Component, OnInit } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CreateSagaComponent } from 'src/app/components/create-update-saga/create-update-saga.component';
import { Saga } from 'src/app/interfaces/saga';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-saga',
  templateUrl: 'saga.page.html',
  styleUrls: ['saga.page.scss'],
})
export class HomePage implements OnInit{
  sagaList:Saga[]
  filterSerie:string="";
  constructor(private modalController: ModalController,
              private _database:DatabaseService,
              private sqlLite:SQLite,
              private _utils:UtilsService) {

              }

  async ngOnInit(){ 
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        console.log("GETTING SAGAS")
        this._database.getSagas().subscribe((data)=>{
          console.log("Sagas change ",data);
          
          this.sagaList=data
        })
      }
    })

  }
  async addSaga(){
    const modal = await this.modalController.create({
    component: CreateSagaComponent,
    componentProps: { value: 123 }
    });
  
    await modal.present();
    const { data }= await modal.onWillDismiss();
    if(data){
      console.log("Data-> "+JSON.stringify(data));
      
      this._database.addSaga(data)
    }
  }
  async edit(saga:Saga){
    const modal = await this.modalController.create({
      component: CreateSagaComponent,
      componentProps: { saga:saga }
      });
    
      await modal.present();
      const { data }= await modal.onWillDismiss();
      if(data){
        console.log("Data-> "+JSON.stringify(data));
        
        this._database.updateSaga(data)
      }
  }
  async del(saga:Saga){
    const { role }= await this._utils.presentAlertConfirm("¿Estas Seguro?","¿Deseas eliminar a '"+saga.name+"'?")
    if(role=="ok"){
      this._database.deleteSaga(saga.id)
    }
  }
}
