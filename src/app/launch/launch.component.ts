import { ConfigService, TelemetryService } from '../services';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

const STALL_ID = 'creation_2';
const IDEA_ID = 'live_coaching_session';


@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.scss']
})
export class LaunchComponent implements OnInit {

  @ViewChild('video', { static: false }) videoElement: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  videoWidth = 0;
  videoHeight = 0;
  openSuccessModal = false;
  openErrorModal = false;
  captureImage = false;
  visitorid = '';
  name = ''
  qrCode = false;
  image: string;
  constraints = {
    video: {
      facingMode: 'environment',
      width: { ideal: 300 },
      height: { ideal: 300 }
    }
  };

  constructor(private renderer: Renderer2,
    public configService: ConfigService,
    public telemetryServcie: TelemetryService,
    public router: Router, private loginService: LoginService) {
    this.loginService.isLoggedIn = false;
    this.loginService.user = undefined;
  }

  ngOnInit() {
    this.telemetryServcie.initialize({
      did: 'device1',
      stallId: STALL_ID,
      ideaId: IDEA_ID
    });
  }

  startCamera() {
    this.openErrorModal = false;
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    } else {
      alert('Sorry, camera not available.');
    }
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  attachVideo(stream) {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
    this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
    });
  }
  capture() {
    this.captureImage = true;
    this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
    this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);
    this.image = this.canvas.nativeElement.toDataURL('image/png');
    this.uploadImage();
  }

  uploadImage() {
    const id = UUID.UUID();
    const imageId = 'do_11295943688090419214';
    const imageName = `${id}.png`;
    fetch(this.image)
      .then(res => res.blob())
      .then(blob => {
        const fd = new FormData();
        const file = new File([blob], imageName);
        fd.append('file', file);
        const request = {
          url: `private/content/v3/upload/${imageId}`,
          data: fd
        };
        this.configService.post(request).pipe(catchError(err => {
          const errInfo = { errorMsg: 'Image upload failed' };
          return throwError(errInfo);
        })).subscribe((response) => {
          console.log('response ', response);
          this.identifyFace(response);
        });
      });
  }

  identifyFace(response) {
    const request = {
      url: `reghelper/face/identify`,
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        request: {
          photo: response.result.content_url
        }
      }
    };
    this.configService.post(request).pipe().subscribe((res) => {
      const data = {
        profileId: res.result.osid
      };
      this.loginService.user = res.result.osid;
      this.telemetryServcie.visit(data);
      this.openSuccessModal = true;
      this.openErrorModal = false;
      this.name = res.result.name;
      console.log('response ', res);
    });
  }

  getUserDtailsByVisitorId() {
    if (this.visitorid) {
      const request = {
        url: `reg/search`,
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          request: {
            entityType: ['Visitor'],
            filters: {
              code: {
                eq: this.visitorid
              }
            }
          }
        }
      };
      this.configService.post(request).pipe().subscribe((res) => {
        if (res.result.Visitor) {
          console.log('response ', res.result.Visitor[0]);
          const data = {
            profileId: res.result.Visitor[0].osid
          };
          this.loginService.user = res.result.Visitor[0].osid;
          this.telemetryServcie.visit(data);
          this.openSuccessModal = true;
          this.openErrorModal = false;
          this.name = res.result.Visitor[0].name;
        }
      });

    }
  }

  gotoWorkspace() {
    this.loginService.isLoggedIn = true;
    this.router.navigate(['/workspace']);
  }

  closeModal() {
    (this.canvas.nativeElement.getContext('2d')).clearRect(0, 0, this.canvas.nativeElement.height, this.canvas.nativeElement.width);
    this.startCamera();
  }

}
