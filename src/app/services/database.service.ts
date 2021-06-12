import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Episode } from '../interfaces/episode';
import { Season } from '../interfaces/season';
import { Serie } from '../interfaces/serie';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  series:BehaviorSubject<Serie[]>=new BehaviorSubject<Serie[]>(null);
  seasons:BehaviorSubject<Season[]>= new BehaviorSubject<Season[]>(null);
  episodes:BehaviorSubject<Episode[]>= new BehaviorSubject<Episode[]>(null);
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
        
        this.loadSeries();
        this.dbReady.next(true);
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
  async loadSeries(){
    return this.db.executeSql("SELECT * FROM serie",[]).then(async (data)=>{
      let series:Serie[]=[];      
      if(data.rows.length>0){
        for (var i=0; i<data.rows.length;i++){
          series.push({
            id:data.rows.item(i).id,
            name:data.rows.item(i).name,
            image:data.rows.item(i).image,
            state:data.rows.item(i).state,
            viewed:data.rows.item(i).viewed,
            webPage:data.rows.item(i).webPage
          })
        }
      }
      this.series.next(series)
    })
  }
  getSeries():Observable<Serie[]>{
    return this.series.asObservable();
  }
  async getSerie(id:number):Promise<Serie>{
    let serie:Serie;
    var resp = await this.db.executeSql("SELECT * FROM serie WHERE id=?",[id]);
    serie={
      id:resp.rows.item(0).id,
      name:resp.rows.item(0).name,
      image:resp.rows.item(0).image,
      state:resp.rows.item(0).state,
      viewed:resp.rows.item(0).viewed,
      webPage:resp.rows.item(0).webPage
    }
    return serie;
  }
  addSerie(serie:Serie):Promise<Serie>{
    var sql="INSERT INTO serie(name, image, state, viewed, webPage) VALUES(?, ?, ?, ?, ?)";
    if(!serie.image){
      sql=sql.replace(/\, image/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(!serie.state){
      sql=sql.replace(/\, state/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(!serie.viewed==undefined ||!serie.viewed==null){
      sql=sql.replace(/\, viewed/,"");
      sql=sql.replace(/\?\,/,"");
    }
    let params=[];
    if(serie.name)params.push(serie.name);
    if(serie.image)params.push(serie.image);
    if(serie.state)params.push(serie.state);
    if(serie.viewed)params.push(serie.viewed);
    if(serie.webPage)params.push(serie.webPage);
    
    return this.db.executeSql(sql,params)
    .then((data:any)=>{
      this.loadSeries();
      return this.getSerie(data.insertId)
    })
  }
  deleteSerie(id){
    return this.db.executeSql('DELETE FROM serie WHERE ID=?',[id]).then(()=>{
      this.loadSeries();
    })
  }
  updateSerie(serie:Serie){
    let sql="UPDATE serie SET name=?, image=?, state=?, viewed=?, webPage=? WHERE id=?";
    return this.db.executeSql(sql,[serie.name,serie.image,serie.state,serie.viewed,serie.webPage,serie.id]).then(()=>{
      this.loadSeries();
    })
  }
  async loadSeasons(id_serie:number){
    return this.db.executeSql("SELECT * FROM season where id_serie=?",[id_serie]).then(async (data)=>{
      let temporadas:Season[]=[];
      let serie= await this.getSerie(id_serie);
      if(data.rows.length>0){
        for (var i=0; i<data.rows.length;i++){
          temporadas.push({
            id:data.rows.item(i).id,
            serie,
            name:data.rows.item(i).name,
            number:data.rows.item(i).number,
            viewed:data.rows.item(i).viewed
          })
        }
      }
      console.log(JSON.stringify(temporadas));
      this.seasons.next(temporadas)
    })
  }
  getSeasons(){
    return this.seasons.asObservable();
  }
  async getSeason(id:number):Promise<Season>{
    let season:Season;
    var resp = await this.db.executeSql("SELECT * FROM season WHERE id=?",[id]);
    season={
      id:resp.rows.item(0).id,
      serie:resp.rows.item(0).serie,
      name:resp.rows.item(0).name,
      number:resp.rows.item(0).number,
      viewed:resp.rows.item(0).viewed
    }
    return season;
  }
  addSeason(season:Season):Promise<Season>{
    var sql="INSERT INTO season(id_serie, name, number, viewed) VALUES(?, ?, ?, ?)";
    if(!season.name){
      sql=sql.replace(/\, name/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(season.viewed==undefined){
      sql=sql.replace(/\, viewed/,"");
      sql=sql.replace(/\?\,/,"");
    }

    let params=[];
    params.push(season.serie.id);
    if(season.name)params.push(season.name);
    params.push(season.number);
    if(season.viewed!=undefined)params.push(season.viewed);
    
    return this.db.executeSql(sql,params)
    .then((data)=>{
      this.loadSeasons(season.serie.id);
      return this.getSeason(data.insertId);
    })
  }
  updateSeason(season:Season){
    var sql="UPDATE season SET id_serie=?, name=?, number=?, viewed=? WHERE id=?";
    if(!season.name){
      sql=sql.replace(/\, name/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(season.viewed==undefined){
      sql=sql.replace(/\, viewed/,"");
      sql=sql.replace(/\?\,/,"");
    }

    let params=[];
    params.push(season.serie.id);
    if(season.name)params.push(season.name);
    params.push(season.number);
    if(season.viewed!=undefined)params.push(season.viewed);
    params.push(season.id);

    return this.db.executeSql(sql,params)
    .then(()=>{
      this.loadSeasons(season.id);
      return this.getSeason(season.id)
    })
  }
  async deleteSeason(id){
    var season= await this.getSeason(id);
    return this.db.executeSql('DELETE FROM season WHERE id=?',[id]).then(()=>{
      this.loadSeries();
      return season;
    })
  }
  async loadEpisodes(id_season:number){
    return this.db.executeSql("SELECT * FROM episodes where id_season=?",[id_season]).then(async (data)=>{
      let episodes:Episode[]=[];
      let season= await this.getSeason(id_season);
      if(data.rows.length>0){
        for (var i=0; i<data.rows.length;i++){
          episodes.push({
            id:data.rows.item(i).id,
            season,
            name:data.rows.item(i).name,
            number:data.rows.item(i).number,
            viewed:data.rows.item(i).viewed
          })
        }
      }
      console.log(JSON.stringify(episodes));
      this.episodes.next(episodes)
    })
  }
  getEpisodes(){
    return this.episodes.asObservable();
  }
  async getEpisode(id:number):Promise<Episode>{
    let episode:Episode;
    var resp = await this.db.executeSql("SELECT * FROM episode WHERE id=?",[id]);
    var season = await this.getSeason(resp.rows.item(0).season)
    episode={
      id:resp.rows.item(0).id,
      season,
      name:resp.rows.item(0).name,
      number:resp.rows.item(0).number,
      viewed:resp.rows.item(0).viewed
    }
    return episode;
  }
  addEpisode(episode:Episode):Promise<Episode>{
    var sql="INSERT INTO episode(id_season, name, number, viewed) VALUES(?, ?, ?, ?)";
    if(!episode.name){
      sql=sql.replace(/\, name/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(episode.viewed==undefined){
      sql=sql.replace(/\, viewed/,"");
      sql=sql.replace(/\?\,/,"");
    }

    let params=[];
    params.push(episode.season.id);
    if(episode.name)params.push(episode.name);
    params.push(episode.number);
    if(episode.viewed!=undefined)params.push(episode.viewed);
    
    return this.db.executeSql(sql,params)
    .then((data)=>{
      this.loadEpisodes(episode.season.id);
      return this.getEpisode(data.insertId);
    })
  }
  updateEpisode(episode:Episode):Promise<Episode>{
    var sql="UPDATE episode SET id_season=?, name=?, number=?, viewed=? WHERE id=?";
    if(!episode.name){
      sql=sql.replace(/\, name/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(episode.viewed==undefined){
      sql=sql.replace(/\, viewed/,"");
      sql=sql.replace(/\?\,/,"");
    }

    let params=[];
    params.push(episode.season.id);
    if(episode.name)params.push(episode.name);
    params.push(episode.number);
    if(episode.viewed!=undefined)params.push(episode.viewed);
    params.push(episode.id);

    return this.db.executeSql(sql,params)
    .then(()=>{
      this.loadEpisodes(episode.season.id);
      return this.getEpisode(episode.id);
    })
  }
  async deleteEpisode(id):Promise<Episode>{
    let episode = await this.getEpisode(id)
    return this.db.executeSql('DELETE FROM season WHERE id=?',[id]).then(()=>{
      this.loadSeries();
      return episode;
    })
  }
  exportSQL():Promise<string>{
    return this.sqlLitePorter.exportDbToSql(this.db)
  }
  importSQL(data:string){
    return this.sqlLitePorter.importSqlToDb(this.db,data).then(()=>{
      this.loadSeries();
    });
  }
}
