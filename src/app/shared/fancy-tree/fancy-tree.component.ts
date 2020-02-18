import { Component, AfterViewInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import 'jquery.fancytree';
import * as _ from 'lodash-es';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-fancy-tree',
  templateUrl: './fancy-tree.component.html'
})
export class FancyTreeComponent implements AfterViewInit {
  @ViewChild('fancyTree', { static: false }) public tree: ElementRef;
  @Input() public nodes: any;
  @Input() public options: any;
  @Input() public rootNode;
  @Output() public itemSelect = new EventEmitter();
  constructor(public activatedRoute: ActivatedRoute) { }
  ngAfterViewInit() {
    let options: any = {
      extensions: ['glyph'],
      clickFolderMode: 3,
      source: this.nodes,
      glyph: {
        preset: 'awesome4',
        map: {
          folder: 'icon folder sb-fancyTree-icon',
          folderOpen: 'icon folder outline sb-fancyTree-icon'
        }
      },
      click: (event, data): boolean => {
        this.tree.nativeElement.click();
        const node = data.node;
        this.itemSelect.emit(node);
        return true;
      },
    };
    options = { ...options, ...this.options };
    $(this.tree.nativeElement).fancytree(options);
    if (this.options.showConnectors) {
      $('.fancytree-container').addClass('fancytree-connectors');
    }
  }
}
