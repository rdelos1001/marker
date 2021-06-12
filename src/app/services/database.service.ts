import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Saga } from '../interfaces/saga';
import { Serie } from '../interfaces/serie';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sagas:BehaviorSubject<Saga[]>=new BehaviorSubject<Saga[]>(null);
  db:SQLiteObject=null;

  constructor(private ptl:Platform,
              private sqlLite:SQLite,
              private sqlLitePorter:SQLitePorter,
              private http:HttpClient,
              private _utils:UtilsService) { 
                this.ptl.ready().then(()=>{
                  this.sqlLite.create({
                    name:'marker.db',
                    location:'default'
                  }).then((db:SQLiteObject)=>{
                    this.db=db;
                    this.createDataBase();
                  })
                })
              }
  createDataBase(){
    this.http.get('assets/createTables.sql',{responseType:"text"}).subscribe(sql=>{
      this.sqlLitePorter.importSqlToDb(this.db,sql).then(_=>{
        console.log("IMPORTACIÓN EXISTOSA");
        
        this.loadSagas();
        this.dbReady.next(true)
      })
      .catch(e=>{
        console.error("ERROR IMPORTANDO SQL")
        console.error(e);
        
      });
    });
  }
  getDatabaseState(){
    return this.dbReady.asObservable();
  }
  getSagas():Observable<Saga[]>{
    return this.sagas.asObservable();
  }

  loadSagas(){
    return this.db.executeSql('SELECT * FROM saga',[]).then((data)=>{
      let sagas: Saga[]=[];
      if(data.rows.length>0){
        for (var i=0; i<data.rows.length;i++){
          sagas.push({
            id:data.rows.item(i).id,
            name:data.rows.item(i).name,
            image:data.rows.item(i).image
          })
        }
      }
      this.sagas.next(sagas)
    })
  }
  getSaga(id):Promise<Saga>{
    return this.db.executeSql('SELECT * FROM saga WHERE id=?',[id]).then((data)=>{
      return {
        id:data.rows.item(0).id,
        name:data.rows.item(0).name,
        image:data.rows.item(0).image,
        seriesCount: data.rows.item(0).seriesCount
      }
    })
  }
  addSaga(saga:Saga){
    if(!saga.image){
      saga.image="assets/shapes.svg"
    }

    return this.db.executeSql('INSERT INTO saga (name, image) VALUES(?,?)',[saga.name,saga.image])
    .then(data=>{
      this.loadSagas();
    })
    .catch(err=>{
      let errStr= JSON.stringify(err);
      if(errStr.includes('UNIQUE constraint failed:')){ 
        this._utils.presentAlert('ERROR',"La saga '"+saga.name+"' ya existe")
      }else{
        this._utils.presentAlert('ERROR',errStr);
      }
    })
  }
  deleteSaga(id){
    return this.db.executeSql('DELETE FROM saga WHERE id=? ',[id]).then(_=>{
      this.loadSagas();
    })
  }
  updateSaga(saga:Saga){
    return this.db.executeSql('UPDATE saga SET name = ?, image = ? WHERE id=?',[saga.name,saga.image,saga.id]).then(()=>{
      this.loadSagas();
    })
  }
  loadSeries(){
    return this.db.executeSql("SELECT * FROM serie").then(async (data)=>{
      let series:Serie[]=[];
      if(data.rows.length>0){
        for (var i=0; i<data.rows.length;i++){
          var saga:Saga=null;
          if(data.rows.item(i).id_saga)
          saga= await this.getSaga(data.rows.item(i).id_saga);
          series.push({
            id:data.rows.item(i).id,
            saga:saga,
            name:data.rows.item(i).name,
            image:data.rows.item(i).image,
            state:data.rows.item(i).state,
            viewed:data.rows.item(i).viewed,
            webPage:data.rows.item(i).webPage
          })
        }
      }
    })
  }
  addSerie(serie:Serie,saga:Saga){
    if(!serie.image){
      serie.image="assets/shapes.svg";
    }
    if(!serie.state){
      serie.state="En emisión";
    }
    if(!serie.viewed==undefined ||!serie.viewed==null){
      serie.viewed=false;
    }
    return this.db.executeSql("INSERT INTO serie(id_saga,name,image,state,viewed,webPage) VALUES(?,?,?,?,?,?)",[saga.id,serie.name,serie.image,serie.state,serie.viewed,serie.webPage])
    .then(()=>{
      this.loadSeries();
    })
  }
  deleteSerie(id){
    return this.db.executeSql('DELETE FROM serie WHERE ID=?',[id]).then(()=>{
      this.loadSeries();
    })
  }
  updateSerie(serie:Serie){
    let sql="UPDATE serie SET id_saga=?, name=?, image=?, state=?, viewed=?, webPage=?";
    return this.db.executeSql(sql,[serie.saga.id,serie.name,serie.image,serie.state,serie.viewed,serie.webPage]).then(()=>{
      this.loadSeries();
    })
  }
  exportSQL():Promise<string>{
    return this.sqlLitePorter.exportDbToSql(this.db)
  }
  importSQL(data:string){
    return this.sqlLitePorter.importSqlToDb(this.db,data).then(()=>{
      this.loadSagas();
    });
  }
}
