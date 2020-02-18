import { WebinarComponent } from './components/webinar/webinar.component';
import { ContentTocComponent } from './components/content-toc/content-toc.component';
import { ContentsListComponent } from './components/contents-list/contents-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '', component: ContentsListComponent
  },
  {
    path: 'books', component: ContentsListComponent
  },
  {
    path: 'play/:contentId', component: ContentTocComponent
  },
  {
    path: 'launch/webinar', component: WebinarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebinarRoutingModule { }
