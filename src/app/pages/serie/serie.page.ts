import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CreateSagaComponent } from 'src/app/components/create-update-saga/create-update-saga.component';
import { CreateUpdateSerieComponent } from 'src/app/components/create-update-serie/create-update-serie.component';
import { Serie } from 'src/app/interfaces/serie';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-serie',
  templateUrl: './serie.page.html',
  styleUrls: ['./serie.page.scss'],
})
export class SeriePage implements OnInit {
  filterSerie:string="";
  serieList:Serie[];
  constructor(private _database:DatabaseService,
              private modalController: ModalController,
              private router:Router) { }

  ngOnInit() {
    this._database.getDatabaseState().subscribe((ready:boolean)=>{
      if(ready){
        this._database.getSeries().subscribe((data)=>{
          this.serieList=data;
        })
      }
    })
    console.log(JSON.stringify(this.serieList));
  }
  async addSerie(){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { }
      });
    
      await modal.present();
      const { data }= await modal.onWillDismiss();
      if(data){
        console.log("Data-> "+JSON.stringify(data));
        var serie= await this._database.addSerie(data);
        this._database.addSeason({
          serie,
          number:1,
          name:"Temporada"
        })
      }
  }
  async edit(serie:Serie){
    const modal = await this.modalController.create({
      component: CreateUpdateSerieComponent,
      componentProps: { serie }
      });
    
      await modal.present();
      const { data }= await modal.onWillDismiss();
      if(data){
        console.log("Data-> "+JSON.stringify(data));
        this._database.updateSerie(data);
      }
  }
  del(serie:Serie){
    this._database.deleteSerie(serie.id);
  }
  inspect(serie:Serie){
    this.router.navigate(['/season',serie.id])
  }
}
