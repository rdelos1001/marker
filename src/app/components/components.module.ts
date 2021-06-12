import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSagaComponent } from './create-update-saga/create-update-saga.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';



@NgModule({
  declarations: [CreateSagaComponent,HeaderComponent,MenuComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[CreateSagaComponent,HeaderComponent,MenuComponent]
})
export class ComponentsModule { }
