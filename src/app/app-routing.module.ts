import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaunchComponent } from './launch/launch.component';

const routes: Routes = [
  {
    path: '', component: LaunchComponent
  },
  {
    path: 'webinar', loadChildren: './webinar/webinar.module#WebinarModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
