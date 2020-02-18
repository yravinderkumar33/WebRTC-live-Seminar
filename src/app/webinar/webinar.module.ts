import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebinarRoutingModule } from './webinar-routing.module';
import { ContentsListComponent } from './components/contents-list/contents-list.component';
import { ContentTocComponent } from './components/content-toc/content-toc.component';

import { HttpClientModule } from '@angular/common/http'
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { SharedModule } from '../shared/shared.module';
import { CreateWebinarComponent } from './components/create-webinar/create-webinar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';
import { WebinarComponent } from './components/webinar/webinar.component';
@NgModule({
  declarations: [ContentsListComponent, ContentTocComponent, CreateWebinarComponent, WebinarComponent],
  imports: [
    CommonModule,
    WebinarRoutingModule,
    HttpClientModule,
    CommonConsumptionModule,
    SharedModule,
    ReactiveFormsModule,
    SuiModule
  ]
})
export class WebinarModule { }
