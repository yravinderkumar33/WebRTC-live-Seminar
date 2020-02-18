import { ContentServiceService } from './../../services/content-service.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-content-toc',
  templateUrl: './content-toc.component.html',
  styleUrls: ['./content-toc.component.css']
})
export class ContentTocComponent implements OnInit {

  collectionTreeNodes;
  constructor(private activatedRoute: ActivatedRoute, private contentService: ContentServiceService, private router: Router) { }
  public content$;
  public showCreateWebinarForm: boolean;

  ngOnInit() {
    this.content$ = this.activatedRoute.params.pipe(
      mergeMap(params => this.getContentDetails(_.get(params, 'contentId')))
    )
  }

  getContentDetails(contentId) {
    return this.contentService.getCollectionHierarchy(contentId).pipe(
      map(res => {
        return { data: res };
      })
    );
  }

  public handleWebinar(event) {
    this.showCreateWebinarForm = false;
    if (_.get(event, 'type') === 'create') {
      this.showCreateWebinarForm = true
    }
  }

  createWebinar(event) {
    this.router.navigate(['/webinar/launch/webinar']).catch(err => {
      console.log('failed to launch webinar');
    })
  }
}
