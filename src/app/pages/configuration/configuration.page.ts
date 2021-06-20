import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { IonicSafeString } from '@ionic/angular';
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage implements OnInit {

  appVersionNumber:string;
  constructor(private appVersion:AppVersion,
              private _database:DatabaseService,
              private _utils:UtilsService,
              private fileChooser:FileChooser,
              private fileOpener:FileOpener) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then(version=>{
      this.appVersionNumber= version;
    })
  }

  openIcon8(){
    Browser.open({url:"https://icons8.com"})
  }
  async downloadSQL(){
    var sql =await this._database.downloadSQL();
    sql=sql.replace(/file:\/\/\/storage\/emulated\/0\/Marker\/[0-9]+.jpg/g,"/assets/shapes.svg");
    Filesystem.requestPermissions().then((value)=>{
      
      if(value.publicStorage=="granted"){
        Filesystem.writeFile({
          data:sql,
          directory:Directory.Documents,
          path:"marker.sql",
          encoding:Encoding.UTF8
        }).then(async (result)=>{
          const {role}= await this._utils.presentAlertConfirm("Éxito", "El sql a sido descargado en <b> \n "+result.uri.substring(result.uri.indexOf("///")+3)+" \n </b>"
          +"¿Deseas abrir el archivo?");
          if(role=="ok"){
            this.fileOpener.open(result.uri,"application/octet-stream")
          }
        })
        .catch((e:Error)=>this._utils.presentAlert("Error",e.message))
      }
    })
  }
  async importSQL(){
    var { role }= await this._utils.presentAlertConfirm("Atención","Todos los datos actuales se eliminarán")
    if(role=="ok"){
    this.fileChooser.open({mime:"application/sql"}).then((uri)=>{
      Filesystem.readFile({
        path:uri,
        encoding:Encoding.UTF8
      }).then(async(result)=>{
          this._database.importSQL(result.data).then(()=>{
            this._utils.presentAlert("Éxito","El archivo se ha importado correctamente");
          })
        })
      })
    }
  }
}
