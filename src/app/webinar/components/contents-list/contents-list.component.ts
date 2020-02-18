import { ContentServiceService } from './../../services/content-service.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-contents-list',
  templateUrl: './contents-list.component.html',
  styleUrls: ['./contents-list.component.css']
})
export class ContentsListComponent implements OnInit {

  private contentIds;
  public contents$;

  constructor(private contentService: ContentServiceService, private router: Router) {
    this.contentIds = ['do_1129601901496647681193', 'do_1129601906803998721194'];
  }
  ngOnInit() {
    this.contents$ = this.fetchContents(this.contentIds);
  }

  private fetchContents(contentIds) {
    return this.contentService.readContents(contentIds);
  }

  public onBookClick(content) {
    this.router.navigate([`/workspace/webinar/play/${_.get(content, 'identifier')}`]);
  }

}
