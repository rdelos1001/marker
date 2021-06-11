import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './saga.page';

import { HomePageRoutingModule } from './saga-routing.module';
import { FilterPipe } from 'src/app/pipes/filter.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage,FilterPipe]
})
export class HomePageModule {}
