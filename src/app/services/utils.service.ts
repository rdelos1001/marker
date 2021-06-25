import { EventEmitter, Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  $filesystemPermision= new EventEmitter<boolean>(false);
  
  constructor(private alertController: AlertController,
              private toastController: ToastController,
              private loadingController: LoadingController) { }

  async presentAlert(header:string,message:string,subHeader?:string) {
    const alert = await this.alertController.create({
      header,
      subHeader: subHeader || '',
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  async presentAlertConfirm(header:string,message:string):Promise<boolean> {
    return new Promise<boolean>(async(resolve)=>{

      const alert = await this.alertController.create({
        header,
        message,
        cssClass: 'alertConfirmClass',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Ok',
          role: 'ok'
        }
      ]
    });
    
    await alert.present();
    const {role}= await alert.onDidDismiss();
    if(role=="ok"){
      resolve(true)
    }else{
      resolve(false);
    }
  })
  }
  async presentLoading(message:string,t?:number) {
    const loading = await this.loadingController.create({
      message,
      duration: t,
      spinner: 'bubbles'
    });
    await loading.present();
  }
  hideLoading(){
    this.loadingController.dismiss();
  }
  async presentToast(message:string,t:number=2000) {
    const toast = await this.toastController.create({
      message,
      duration: t
    });
    toast.present();
  }
  async presentToastConfirm(message:string,btnText:string,t:number=2000) {
    var clicked=false;
    const toast = await this.toastController.create({
      message,
      duration: t,
      buttons: [
        {
          side: 'end',
          text: btnText,
          handler: () => {
            clicked=true;
          }
        }
      ]
    });
    await toast.present();
    await toast.onDidDismiss();
    return clicked;
  }
  requestFileSystemPermission():Promise<boolean>{
    return new Promise<boolean>((resolve)=>{
      Filesystem.checkPermissions().then(value=>{
        if(value.publicStorage!="granted"){
          Filesystem.requestPermissions().then(permission=>{
            if(permission.publicStorage=="granted"){
              this.$filesystemPermision.emit(true);
              resolve(true);
            }else{
              resolve(false);
            }
          });
        }else{
          resolve(true);
        }
      })
    })
  }
}
