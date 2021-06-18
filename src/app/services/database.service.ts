import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Season } from '../interfaces/season';
import { Serie } from '../interfaces/serie';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  db:SQLiteObject=null;
  seasons:BehaviorSubject<Season[]> = new BehaviorSubject(null);
  series:BehaviorSubject<Serie[]> = new BehaviorSubject(null);

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
        this.dbReady.next(true);
      })
      .catch(e=>{
        console.error(e);        
      });
    });
  }
  getDatabaseState(){
    return this.dbReady.asObservable();
  }
  async loadSeries(){
    let series:Serie[]=[];      
    var data = await this.db.executeSql("SELECT * FROM serie",[])
    if(data.rows.length>0){
      for (var i=0; i<data.rows.length;i++){
        series.push({
          id:data.rows.item(i).id,
          name:data.rows.item(i).name,
          image:data.rows.item(i).image,
          state:data.rows.item(i).state,
          webPage:data.rows.item(i).webPage
        })
      }
    }
    this.series.next(series);
  }
  getSeries(){
    return this.series.asObservable();
  }

  async getSerie(id:number):Promise<Serie>{
    if(!id){
      console.error("No hay id "+id);
      return null
    }
    let serie:Serie={
      name:null
    };
    var resp = await this.db.executeSql("SELECT * FROM serie WHERE id=?",[id]);
    if(resp.rows.length>0){
      serie.id=resp.rows.item(0).id;
      serie.name=resp.rows.item(0).name;
      serie.image=resp.rows.item(0).image;
      serie.state=resp.rows.item(0).state;
      if(serie.webPage)serie.webPage=resp.rows.item(0).webPage;
      return serie;
    }else{
      return null;
    }
  }
  async addSerie(serie:Serie):Promise<Serie>{
    var sql="INSERT INTO serie(name, image, state, webPage) VALUES(?, ?, ?, ?)";
    if(!serie.image){
      sql=sql.replace(/\, image/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(!serie.state){
      sql=sql.replace(/\, state/,"");
      sql=sql.replace(/\?\,/,"");
    }
    if(!serie.webPage){
      sql=sql.replace(/\, webPage/,"");
      sql=sql.replace(/\?\,/,"");
    }
    let params=[];
    if(serie.name)params.push(serie.name);
    if(serie.image)params.push(serie.image);
    if(serie.state)params.push(serie.state);
    if(serie.webPage)params.push(serie.webPage);
    
    var data = await this.db.executeSql(sql,params);    
    return this.getSerie(data.insertId);
  }
  async deleteSerie(id){
    var serie= this.getSerie(id);
    await this.db.executeSql('DELETE FROM serie WHERE ID=?',[id]);
    this.loadSeries();
    return serie;
  }
  async updateSerie(serie:Serie){
    if(!serie.id)
    throw new Error("No hay id de serie");
    let sql="UPDATE serie SET name=?, image=?, webPage=?, state=? WHERE id=?";
    if(!serie.image){
      sql=sql.replace(/\, image=\?/,"");
    }
    if(!serie.webPage){
      sql=sql.replace(/\, webPage=\?/,"");
    }
    var params=[];
    
    params.push(serie.name);
    if(serie.image)params.push(serie.image);
    if(serie.webPage)params.push(serie.webPage);
    if(serie.state)params.push(serie.state);
    params.push(serie.id)
    await this.db.executeSql(sql,params);
    this.loadSeries();
    return this.getSerie(serie.id);
  }
  async loadSeasons(id_serie){
    let temporadas:Season[]=[];
    var data = await this.db.executeSql("SELECT * FROM season where id_serie=?",[id_serie]);
    if(data.rows.length>0){
      let serie= await this.getSerie(id_serie);
      for (var i=0; i<data.rows.length;i++){
        temporadas.push({
          id:data.rows.item(i).id,
          serie,
          number:data.rows.item(i).number,
          totalEpisodes:data.rows.item(i).totalEpisodes,
          viewedEpisodes:data.rows.item(i).viewedEpisodes
        })
      }
    }    
    this.seasons.next(temporadas);
  }
  getSeasons(){
    return this.seasons.asObservable();
  }
  async getSeason(id:number):Promise<Season>{
    let season:Season;    
    var resp = await this.db.executeSql("SELECT * FROM season WHERE id=?",[id]);
    if(resp.rows.length>0){
      var serie= await this.getSerie(resp.rows.item(0).serie);
      season={
        id:resp.rows.item(0).id,
        serie,
        number:resp.rows.item(0).number,
        totalEpisodes:resp.rows.item(0).totalEpisodes,
        viewedEpisodes:resp.rows.item(0).viewedEpisodes
      }
      return season;
    }else{
      return null;
    }
  }
  async addSeason(season:Season):Promise<Season>{
    var sql="INSERT INTO season(number, id_serie, totalEpisodes, viewedEpisodes) VALUES(?, ?, ?, ?)";
    if(!season.totalEpisodes){
      sql=sql.replace(/\, totalEpisodes/,"");
      sql=sql.replace(/\?\,/,"");
    }

    if(!season.viewedEpisodes){
      sql=sql.replace(/\, viewedEpisodes/,"");
      sql=sql.replace(/\?\,/,"");
    }
    let params=[];
    params.push(season.number);
    params.push(season.serie.id);
    if(season.totalEpisodes)params.push(season.totalEpisodes);
    if(season.viewedEpisodes)params.push(season.viewedEpisodes);

    var data= await this.db.executeSql(sql,params);
    this.loadSeasons(season.serie.id);
    return await this.getSeason(data.insertId)
  }
  async updateSeason(season:Season):Promise<Season>{
    if(!season.id)throw new Error("No hay id de temporada");

    var sql="UPDATE season SET id_serie=?, number=?, totalEpisodes=?, viewedEpisodes=? WHERE id=?";

    if(!season.totalEpisodes){
      sql=sql.replace(/\, totalEpisodes=\?\,/,"");
    }
    if(!season.viewedEpisodes){
      sql=sql.replace(/\, viewedEpisodes=\?\,/,"");
    }

    let params=[];
    params.push(season.serie.id);
    params.push(season.number);
    if(season.totalEpisodes)params.push(season.totalEpisodes)
    if(season.viewedEpisodes)params.push(season.viewedEpisodes)
    params.push(season.id);

    await this.db.executeSql(sql,params);
    this.loadSeasons(season.id);
    return this.getSeason(season.id)
  }
  async deleteSeason(id){
    var season = await this.getSeason(id);
    this.db.executeSql('DELETE FROM season WHERE id=?',[id]);
    this.loadSeasons(id);
    return season;
  }

  exportSQL():Promise<string>{
    return this.sqlLitePorter.exportDbToSql(this.db)
  }
  importSQL(data:string){
    return this.sqlLitePorter.importSqlToDb(this.db,data);
  }
  getNextEpisode(season:Season){
    var nextEpisode:string="";
    if(season.totalEpisodes==season.viewedEpisodes){
      nextEpisode=(season.number+1)+"x1";
    }else{
      nextEpisode=(season.viewedEpisodes+1)+"";
    }
  }
}
