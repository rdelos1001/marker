import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeriePageRoutingModule } from './serie-routing.module';

import { SeriePage } from './serie.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FilterPipe } from 'src/app/pipes/filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeriePageRoutingModule,
    ComponentsModule
  ],
  declarations: [SeriePage,FilterPipe]
})
export class SeriePageModule {}
