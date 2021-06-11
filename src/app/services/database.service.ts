import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Saga } from '../interfaces/saga';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sagas:BehaviorSubject<Saga[]>=new BehaviorSubject<Saga[]>([{}]);
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
            image:data.rows.item(i).image,
            seriesCount: data.rows.item(i).seriesCount
          })
        }
      }
      this.sagas.next(sagas)
    })
  }
  addSaga(saga:Saga){
    if(!saga.image){
      saga.image="assets/icon/default-image.png"
    }
    if(!saga.seriesCount){
      saga.seriesCount=1
    }
    return this.db.executeSql('INSERT INTO saga (name, image,seriesCount) VALUES(?,?,?)',[saga.name,saga.image,saga.seriesCount])
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
  deleteSaga(id){
    return this.db.executeSql('DELETE FROM saga WHERE id=?',[id]).then(_=>{
      this.loadSagas();
    })
  }
  updateSaga(saga:Saga){
    return this.db.executeSql('UPDATE saga SET name = ?, image = ?, seriesCount = ? WHERE id=?',[saga.name,saga.image,saga.seriesCount,saga.id]).then(()=>{
      this.loadSagas();
    })
  }
}
