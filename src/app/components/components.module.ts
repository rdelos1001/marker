import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSagaComponent } from './create-update-saga/create-update-saga.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { CreateUpdateSerieComponent } from './create-update-serie/create-update-serie.component';

@NgModule({
  declarations: [
    CreateSagaComponent,
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
    CreateSagaComponent,
    CreateUpdateSerieComponent,
    HeaderComponent,
    MenuComponent
  ]
})
export class ComponentsModule { }
