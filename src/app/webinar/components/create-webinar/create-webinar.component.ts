import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as _ from 'lodash-es';
@Component({
  selector: 'app-create-webinar',
  templateUrl: './create-webinar.component.html',
  styleUrls: ['./create-webinar.component.scss']
})
export class CreateWebinarComponent implements OnInit {

  @Output() public createWebinarEvent = new EventEmitter();

  constructor(private fb: FormBuilder) { }
  public createWebinarForm: FormGroup;
  public pickerMinDate = new Date(new Date().setHours(0, 0, 0, 0));
  @Output() close = new EventEmitter();
  @ViewChild('modal', { static: false }) public modal;

  ngOnInit() {
    this.prepareWebinarForm();
  }

  validateStartDate(control: AbstractControl) {
    const value = _.get(control, 'value');
    const currentTime = Date.now();
    if (value < currentTime && value !== null) {
      return {
        invalidtime: 'Start date cannot be less than the current time'
      }
    }
    return null;
  }

  validateEndDate(control: AbstractControl) {
    const value = _.get(control, 'value');
    const currentTime = Date.now();
    if (value < currentTime && value !== null) {
      return {
        invalidtime: 'End date cannot be less than the current time'
      }
    }
    return null;
  }

  private prepareWebinarForm() {
    this.createWebinarForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  public createWebinar() {
    this.modal.deny();
    this.close.emit()
    const value = this.createWebinarForm.value;
    this.createWebinarEvent.emit(value);
  }
}
