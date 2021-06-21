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
  async presentAlertConfirm(header:string,message:string) {
    const alert = await this.alertController.create({
      header,
      message,
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
    return alert.onDidDismiss()
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
    this.loadingController.dismiss()
  }
  async presentToast(message:string,t:number=2000) {
    const toast = await this.toastController.create({
      message,
      duration: t
    });
    toast.present();
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
