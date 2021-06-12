import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

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
              private fileChooser:FileChooser) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then(version=>{
      this.appVersionNumber= version;
    })
  }
  async downloadSQL(){
    const {role}= await this._utils.presentAlertConfirm('Exportar SQL',"¿Estas seguro de exportar la base de datos en formato SQL?");
    if(role){
      if(role=="ok"){
        let data= await this._database.exportSQL();
        data=data.substring(data.indexOf('INSERT'));
        data=data.replace(/ OR REPLACE/g,"");
        data=data.replace(/\(id\,/g,"(");
        data=data.replace(/VALUES \(\'[0-9]+\'\,/g,"VALUES (");
        await Filesystem.writeFile({
          path: 'markerDB.sql',
          data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        }).then(result=>{
          this._utils.presentAlert('Éxito',`El SQL ha sido descargado en '${result.uri.substring(7)}'` );
        });
      }
    }
  }
  importSQL(){
    this.fileChooser.open({mime:"application/sql"}).then(uri=>{
      Filesystem.readFile({path:uri,encoding:Encoding.UTF8}).then(result=>{        
        this._database.importSQL(result.data).then(()=>{
          this._utils.presentAlert('ÉXITO','Se ha importado el archivo')
        })
      })
    })
  }
}
