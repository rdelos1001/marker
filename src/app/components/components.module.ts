import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSagaComponent } from './create-update-saga/create-update-saga.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [CreateSagaComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[CreateSagaComponent]
})
export class ComponentsModule { }
