import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { CreateUpdateSerieComponent } from './create-update-serie/create-update-serie.component';
import { EditSeasonComponent } from './edit-season/edit-season.component';

@NgModule({
  declarations: [
    CreateUpdateSerieComponent,
    HeaderComponent,
    MenuComponent,
    EditSeasonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[
    CreateUpdateSerieComponent,
    HeaderComponent,
    MenuComponent,
    EditSeasonComponent
  ]
})
export class ComponentsModule { }
