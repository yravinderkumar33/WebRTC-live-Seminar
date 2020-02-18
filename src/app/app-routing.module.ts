import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaunchComponent } from './launch/launch.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { from } from 'rxjs';

const routes: Routes = [
  {
    path: '', component: LaunchComponent
  },
  {
    path: 'workspace', component: WorkspaceComponent
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
