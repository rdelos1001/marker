import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private alertController: AlertController,private toastController: ToastController) { }

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
}
