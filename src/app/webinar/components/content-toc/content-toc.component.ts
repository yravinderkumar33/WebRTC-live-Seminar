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

  private selectedChildNode;
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
    this.selectedChildNode = _.get(event, 'child');
    if (_.get(event, 'type') === 'create') {
      this.showCreateWebinarForm = true
    } else {
      console.log(event);
    }
  }

  contentSelect(event) {
    if (_.get(event, 'content.model')) {
      const sessionDetails = JSON.parse(_.get(event, 'content.model.sessionDetails'));
      window.location.href = sessionDetails.webinarUrl;
    }
  }

  createWebinar({ name, description, startDate, endDate }) {
    const contentID = _.get(this.activatedRoute, 'snapshot.params.contentId');
    const childId = _.get(this.selectedChildNode, 'id');

    // todo change the contenttype to Webinar - new content type
    const createContentRequestBody = {
      name: name,
      mimeType: 'video/mp4',
      code: "test.coaching.0",
      contentType: "CoachingSession",
      startTime: Date.parse(startDate),
      endTime: Date.parse(endDate),
      sessionDetails: {
        "name": name,
        "description": description,
        "startdate": Date.parse(startDate),
        "endDate": Date.parse(endDate),
        "creator": "123",
        "webinarUrl": `/webinar/launch/webinar#${contentID}`
      }
    }
    this.contentService.createContent(createContentRequestBody).pipe(
      mergeMap((res: any) => {
        const request = {
          rootId: contentID,
          unitId: childId,
          children: [_.get(res, 'result.identifier')]
        }
        return this.contentService.addResourceToHierarchy(request);
      })
    ).subscribe(res => {
      this.router.navigate(['/webinar/launch/webinar#', contentID]).catch(err => {
        console.log('failed to launch webinar');
      })
    }, err => {
      console.log('err', err);
      this.router.navigate(['/']).catch(err => {
        console.log('failed to redirect to home page');
      })
      console.log('Something went wrong during the process');
    })
  }
}
