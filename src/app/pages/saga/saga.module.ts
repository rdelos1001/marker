import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SagaPage } from './saga.page';

import { SagaPageRoutingModule } from './saga-routing.module';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SagaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SagaPage,FilterPipe]
})
export class SagaPageModule {}
