import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWebinarComponent } from './create-webinar.component';

describe('CreateWebinarComponent', () => {
  let component: CreateWebinarComponent;
  let fixture: ComponentFixture<CreateWebinarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateWebinarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWebinarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
