import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash-es';
import { Router } from '@angular/router';
import { ConfigService } from '../services';
@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  curationData = ['cml_tags', 'cml_keywords', 'cml_quality', 'ckp_translation', 'ckp_size'];
  metaData = [];
  contents = [];
  showContentQuality = false;
  constructor(public config: ConfigService, public router: Router) { }
  ngOnInit() {

  }
}