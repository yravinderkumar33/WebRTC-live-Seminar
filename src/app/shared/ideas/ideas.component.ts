import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ideas',
  templateUrl: './ideas.component.html',
  styleUrls: ['./ideas.component.scss']
})
export class IdeasComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  redirect() {
    this.router.navigate(['/workspace/webinar']);
  }
}
