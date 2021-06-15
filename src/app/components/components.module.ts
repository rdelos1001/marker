import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { CreateUpdateSerieComponent } from './create-update-serie/create-update-serie.component';

@NgModule({
  declarations: [
    CreateUpdateSerieComponent,
    HeaderComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[
    CreateUpdateSerieComponent,
    HeaderComponent,
    MenuComponent
  ]
})
export class ComponentsModule { }
