import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DatabaseService } from 'src/app/services/database.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Browser } from '@capacitor/browser';
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
    if(role && role=="ok"){
      let fullSql= await this._database.exportSQL();
      /*Descargar archivo de INSERTS */
      let data=fullSql.substring(fullSql.indexOf('INSERT'));
      data = "/* MARKER APP SQL INSERTS DE LA BBDD*/\n"+data;
      data=data.replace(/ OR REPLACE/g,"");
      data=data.replace(/\(id\,/g,"(");
      data=data.replace(/VALUES \(\'[0-9]+\'\,/g,"VALUES (");
      var resultInserts= await Filesystem.writeFile({
        path: 'markerDBValues.sql',
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })
      
      data = fullSql.substring(0,fullSql.indexOf("INSERT"));
      data = "/* MARKER APP SQL ESTRUCTURA DE LA BBDD*/\n"+data;
      var resultsEstructure= await Filesystem.writeFile({
        path: 'markerDB.sql',
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })
      this._utils.presentAlert('Éxito',`Archivos SQL han sido descargado en '${resultsEstructure.uri.substring(7,resultsEstructure.uri.lastIndexOf("/"))}'` );
    }
  }
  importSQL(){
    this.fileChooser.open({mime:"application/sql"}).then(uri=>{
      Filesystem.readFile({path:uri,encoding:Encoding.UTF8}).then(result=>{        
        this._database.importSQL(result.data).then(()=>{
          this._database.loadSeries();
          this._utils.presentAlert('ÉXITO','Se ha importado el archivo');
        })
      })
    })
  }
  openIcon8(){
    Browser.open({url:"https://icons8.com"})
  }
}
