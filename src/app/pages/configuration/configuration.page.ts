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
  constructor(private appVersion:AppVersion) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then(version=>{
      this.appVersionNumber= version;
    })
  }

  openIcon8(){
    Browser.open({url:"https://icons8.com"})
  }
}
