import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'saga',
    loadChildren: () => import('./pages/saga/saga.module').then( m => m.SagaPageModule)
  },
  {
    path: '',
    redirectTo: 'saga',
    pathMatch: 'full'
  },
  {
    path: 'season',
    loadChildren: () => import('./pages/season/season.module').then( m => m.SeasonPageModule)
  },
  {
    path: 'episodes',
    loadChildren: () => import('./pages/episodes/episodes.module').then( m => m.EpisodesPageModule)
  }, {
    path: 'serie',
    loadChildren: () => import('./pages/serie/serie.module').then( m => m.SeriePageModule)
  },
  {
    path: 'configuration',
    loadChildren: () => import('./pages/configuration/configuration.module').then( m => m.ConfigurationPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
