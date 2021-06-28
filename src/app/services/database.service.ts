import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { Season } from '../interfaces/season';
import { Serie } from '../interfaces/serie';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  db:SQLiteObject=null;
  seasons:BehaviorSubject<Season[]> = new BehaviorSubject(null);

  constructor(private ptl:Platform,
              private sqlLite:SQLite,
              private sqlLitePorter:SQLitePorter,
              private http:HttpClient) { 
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
  /**
   * Devuelve count cantidades de series empezando por start
   * start empieza en 0 y está incluido
   * si start es -1 saca todas las series
   * */
  async getNSeries(start:number,count:number):Promise<Serie[]>{
    /*SELECT * FROM serie LIMIT start,30*/
    let series:Serie[]=[]
    var data;
    if(start!=-1){
      data =await this.db.executeSql("SELECT * FROM serie ORDER BY LOWER(name) LIMIT ?,?",[start,count]);
    }else{
      data = await this.db.executeSql("SELECT * FROM serie ORDER BY LOWER(name)",[]);
    }
    if(data.rows.length>0){
      for (let i = 0; i < data.rows.length; i++) {
        series.push(new Serie(
          data.rows.item(i).id,
          data.rows.item(i).name,
          data.rows.item(i).image,
          data.rows.item(i).state,
          data.rows.item(i).webPage
          )
        )
      }
    }
    console.log(`SERIES A SACAR start = ${start} count = ${count}\n ${JSON.stringify(series)}`);
    
    return series;
  }
  async getSerie(id:number):Promise<Serie>{
    if(!id){
      console.error("No hay id "+id);
      return null
    }
    let serie=new Serie();
    var resp = await this.db.executeSql("SELECT * FROM serie WHERE id=?",[id]);
    if(resp.rows.length>0){
      serie.id=resp.rows.item(0).id;
      serie.name=resp.rows.item(0).name;
      serie.image=resp.rows.item(0).image;
      serie.state=resp.rows.item(0).state;
      serie.webPage=serie.webPage=resp.rows.item(0).webPage;
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
      var serie= await this.getSerie(resp.rows.item(0).id_serie);
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
    return await this.getSeason(data.insertId)
  }
  async updateSeason(season:Season):Promise<Season>{
    if(!season.id)throw new Error("No hay id de temporada");

    var sql="UPDATE season SET id_serie=?, number=?, webPage=?, totalEpisodes=?, viewedEpisodes=? WHERE id=?";

    if(!season.webPage){
      sql=sql.replace(/\, webPage=\?/,"");
    }

    if(!season.totalEpisodes){
      sql=sql.replace(/\, totalEpisodes=\?/,"");
    }
    if(!season.viewedEpisodes){
      sql=sql.replace(/\, viewedEpisodes=\?/,"");
    }

    let params=[];
    params.push(season.serie.id);
    params.push(season.number);
    if(season.webPage)params.push(season.webPage);
    if(season.totalEpisodes)params.push(season.totalEpisodes)
    if(season.viewedEpisodes)params.push(season.viewedEpisodes)
    params.push(season.id);

    await this.db.executeSql(sql,params);
    return this.getSeason(season.id)
  }
  async deleteSeason(id){
    var season = await this.getSeason(id);
    this.db.executeSql('DELETE FROM season WHERE id=?',[id]);
    return season;
  }
  getNextEpisode(season:Season):number{
    return (season.viewedEpisodes+1);
  }
  async getNextEpisodeSerie(serie:Serie):Promise<string>{
   await this.loadSeasons(serie.id)
   var seasons =this.seasons.getValue(); 
    seasons.sort((a,b)=>b.number-a.number);
    var nextEpisodeValue=this.getNextEpisode(seasons[0]);
    if(nextEpisodeValue<=9){
      return seasons[0].number+"x0"+nextEpisodeValue;
    }else{
      return seasons[0].number+"x"+nextEpisodeValue;
    }
  }
  downloadSQL():Promise<string>{
    return this.sqlLitePorter.exportDbToSql(this.db);
  }
 async importSQL(sql:string){
    await this.sqlLitePorter.wipeDb(this.db)
    return this.sqlLitePorter.importSqlToDb(this.db,sql);
  }
}
