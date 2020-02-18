import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionTreeComponent } from './collection-tree/collection-tree.component';
import { FancyTreeComponent } from './fancy-tree/fancy-tree.component';
import { SuiModule } from 'ng2-semantic-ui/dist';
import { SuiAccordionModule  } from 'ng2-semantic-ui';

@NgModule({
  declarations: [CollectionTreeComponent, FancyTreeComponent],
  imports: [
    CommonModule,
    SuiAccordionModule
  ],
  exports: [CollectionTreeComponent, FancyTreeComponent]
})
export class SharedModule { }
