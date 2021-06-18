import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Season } from 'src/app/interfaces/season';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-edit-season',
  templateUrl: './edit-season.component.html',
  styleUrls: ['./edit-season.component.scss'],
})
export class EditSeasonComponent implements OnInit {

  @Input() id_season:number;
  @Input() serieName:string;
  constructor(private modalController: ModalController,
              private _database:DatabaseService,
              private _utils:UtilsService) { }

  season:Season={
    number:0,serie:null
  }
  ngOnInit() {
    this._database.getSeason(this.id_season).then((season)=>{
      this.season=season;
    })
  }
  cancel(){
    this.modalController.dismiss();
  }
  verify(){
    this.season.viewedEpisodes=this.season.viewedEpisodes<0?0:Number.parseInt(this.season.viewedEpisodes+"");
    this.season.totalEpisodes=this.season.totalEpisodes<0?0:Number.parseInt(this.season.totalEpisodes+"");
    if(this.season.viewedEpisodes>this.season.totalEpisodes){
      this.season.totalEpisodes=this.season.viewedEpisodes;
    }
  }
  async del(){
    const { role } =await this._utils.presentAlertConfirm("Aviso",`¿Desea eliminar la temporada ${this.season.number} de la serie ${this.serieName}`)
    if(role=="ok")
    this._database.deleteSeason(this.id_season).then(()=>{
      this.modalController.dismiss();
    })
  }
  save(){
    this.modalController.dismiss(this.season)
  }
}
