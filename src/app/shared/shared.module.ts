import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionTreeComponent } from './collection-tree/collection-tree.component';
import { FancyTreeComponent } from './fancy-tree/fancy-tree.component';
import { SuiModule } from 'ng2-semantic-ui/dist';
import { SuiAccordionModule  } from 'ng2-semantic-ui';
import { HeaderComponent } from './header/header.component';
import { IdeasComponent } from './ideas/ideas.component';

@NgModule({
  declarations: [CollectionTreeComponent, FancyTreeComponent, HeaderComponent, IdeasComponent],
  imports: [
    CommonModule,
    SuiAccordionModule
  ],
  exports: [CollectionTreeComponent, FancyTreeComponent, HeaderComponent, IdeasComponent]
})
export class SharedModule { }
