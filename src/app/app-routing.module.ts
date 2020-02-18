import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaunchComponent } from './launch/launch.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { from } from 'rxjs';
import { IdeasComponent } from './shared/ideas/ideas.component';

const routes: Routes = [
  {
    path: '', component: LaunchComponent
  },
  {
    path: 'workspace', component: WorkspaceComponent,
    children: [
      {
        path: '', component: IdeasComponent
      },
      {
        path: 'webinar', loadChildren: './webinar/webinar.module#WebinarModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
