import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as _ from 'lodash-es';
import { Subscription, Subject } from 'rxjs';
import * as TreeModel from 'tree-model';
import { Router } from '@angular/router';
import { appConfig } from '../config';

export enum MimeTypeTofileType {
  'application/vnd.ekstep.ecml-archive' = 'ECML',
  'application/vnd.ekstep.html-archive' = 'HTML',
  'application/vnd.android.package-archive' = 'APK',
  'application/vnd.ekstep.content-archive' = 'ECML',
  'application/vnd.ekstep.content-collection' = 'collection',
  'application/vnd.ekstep.plugin-archive' = 'plugin',
  'application/vnd.ekstep.h5p-archive' = 'H5P',
  'application/epub' = 'epub',
  'text/x-url' = 'url',
  'video/x-youtube' = 'youtube',
  'application/octet-stream' = 'doc',
  'application/msword' = 'doc',
  'application/pdf' = 'pdf',
  'image/jpeg' = 'image',
  'image/jpg' = 'image',
  'image/png' = 'image',
  'image/tiff' = 'image',
  'image/bmp' = 'image',
  'image/gif' = 'image',
  'image/svg+xml' = 'image',
  'video/avi' = 'video',
  'video/mpeg' = 'video',
  'video/quicktime' = 'video',
  'video/3gpp' = 'video',
  'video/mp4' = 'video',
  'video/ogg' = 'video',
  'video/webm' = 'video',
  'audio/mp3' = 'audio',
  'audio/mp4' = 'audio',
  'audio/mpeg' = 'audio',
  'audio/ogg' = 'audio',
  'audio/webm' = 'audio',
  'audio/x-wav' = 'audio',
  'audio/wav' = 'audio'
}


@Component({
  selector: 'app-collection-tree',
  templateUrl: './collection-tree.component.html',
  styleUrls: ['./collection-tree.component.css']
})
export class CollectionTreeComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public nodes;
  public options: any;
  @Output() public contentSelect: EventEmitter<{ id: string, title: string }> = new EventEmitter();
  @Input() contentStatus: any;
  @Output() public handleWebinarEvent = new EventEmitter();
  private rootNode: any;
  private selectLanguage: string;
  private contentComingSoonDetails: any;
  public rootChildrens: any;
  private languageSubscription: Subscription;
  private iconColor = {
    '0': 'fancy-tree-black',
    '1': 'fancy-tree-blue',
    '2': 'fancy-tree-green'
  };
  public commingSoonMessage: string;
  public unsubscribe$ = new Subject<void>();

  constructor(public router: Router) {
    this.options = appConfig.collectionTreeOptions;
  }
  ngOnInit() {
    this.initialize();
  }

  ngOnChanges() {
    this.initialize();
  }

  public onNodeClick(node: any) {
    if (!node.folder) {
      this.contentSelect.emit({ id: node.id, title: node.title });
    }
  }

  public onItemSelect(item: any) {
    if (!item.folder) {
      this.contentSelect.emit({ id: item.data.id, title: item.title });
    }
  }

  private initialize() {
    this.rootNode = this.createTreeModel();
    if (this.rootNode) {
      this.rootChildrens = this.rootNode.children;
      this.addNodeMeta();
    }
  }

  handleWebinar(child, eventType) {
    this.handleWebinarEvent.emit({child, type: eventType});
  }

  private createTreeModel() {
    if (!this.nodes) { return; }
    const model = new TreeModel();
    return model.parse(this.nodes.data);
  }

  private addNodeMeta() {
    if (!this.rootNode) { return; }
    this.rootNode.walk((node) => {
      node.fileType = MimeTypeTofileType[node.model.mimeType];
      node.id = node.model.identifier;
      if (node.children && node.children.length) {
        if (this.options.folderIcon) {
          node.icon = this.options.folderIcon;
        }
        node.folder = true;
      } else {
        if (node.fileType === MimeTypeTofileType['application/vnd.ekstep.content-collection']) {
          node.folder = true;
        } else {
          const indexOf = _.findIndex(this.contentStatus, {});
          if (this.contentStatus) {
            const content: any = _.find(this.contentStatus, { 'contentId': node.model.identifier });
            const status = (content && content.status) ? content.status.toString() : 0;
            node.iconColor = this.iconColor[status];
          } else {
            node.iconColor = this.iconColor['0'];
          }
          node.folder = false;
        }
        node.icon = this.options.customFileIcon[node.fileType] || this.options.fileIcon;
        node.icon = `${node.icon} ${node.iconColor}`;
      }
      if (node.folder && !(node.children.length)) {
        this.setCommingSoonMessage(node);
        node.title = node.model.name + '<span> (' + this.commingSoonMessage + ')</span>';
        node.extraClasses = 'disabled';
      } else {
        node.title = node.model.name || 'Untitled File';
        node.extraClasses = '';
      }
    });
  }

  private setCommingSoonMessage(node) {
    this.commingSoonMessage = '';
    const nodes = node.getPath();
    const altMessages = [];
    nodes.forEach((eachnode, index) => {
      if (_.has(eachnode, 'model.altMsg') && eachnode.model.altMsg.length) {
        altMessages.push(eachnode.model.altMsg[0]);
      }
    });
    if (altMessages.length > 0) {
      this.commingSoonMessage = 'Contents coming soon...';
    } else if (this.contentComingSoonDetails) {
      this.commingSoonMessage = 'Contents coming soon...';
    }
    if (!this.commingSoonMessage) {
      this.commingSoonMessage = 'Contents coming soon...';
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
