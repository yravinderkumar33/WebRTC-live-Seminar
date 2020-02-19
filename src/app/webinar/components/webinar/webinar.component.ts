import { ToasterService } from './../../../services/toaster/toaster.service';
import { mergeMap, switchMap, retry } from 'rxjs/operators';
import { environment } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { WebrtcBroadcastService } from '../../services/webrtc-broadcast.service';
import * as _ from 'lodash-es';
import { LoginService } from 'src/app/services/login/login.service';
import { ContentServiceService } from '../../services/content-service.service';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-webinar',
  templateUrl: './webinar.component.html',
  styleUrls: ['./webinar.component.scss']
})
export class WebinarComponent implements OnInit {

  hideCreateWebinarForm: boolean = false;
  lodash = _;
  broadcastUI;
  participants
  startConferencing
  roomsList
  disableDownloadButton: boolean = true;
  disableEndRecordStreamButton: boolean = true;
  showLoader: boolean = true;
  sessionDetails: any;
  addClass: boolean = false;
  propertiesToshow: any;

  contentDetails$: any;

  config = {
    openSocket: function (config) {
      var SIGNALING_SERVER = environment.signalingServer;
      config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
      var sender = Math.round(Math.random() * 999999999) + 999999999;

      window['io'].connect(SIGNALING_SERVER).emit('new-channel', {
        channel: config.channel,
        sender: sender
      });

      var socket = window['io'].connect(SIGNALING_SERVER + config.channel);
      socket['channel'] = config.channel;
      socket.on('connect', function () {
        if (config.callback) config.callback(socket);
      });

      socket.send = function (message) {
        socket.emit('message', {
          sender: sender,
          data: message
        });
        return null;
      };

      socket.on('message', config.onmessage);
    },
    onRemoteStream: (media) => {
      var video = media.video;
      video.setAttribute('controls', true);
      const div = document.createElement('div');
      div.classList.add('video-play', 'aspectratio');
      div.setAttribute('data-ratio', '16:9');
      div.appendChild(video);
      this.participants.insertBefore(div, this.participants.firstChild);
      video.play();
      this.rotateVideo(video);
    },
    onRoomFound: (room) => {
      var alreadyExist = document.getElementById(room.broadcaster);
      if (alreadyExist) return;
      if (typeof this.roomsList === 'undefined') this.roomsList = document.body;
      this.hideCreateWebinarForm = true;
      const div = document.createElement('div');
      div.classList.add('d-flex', 'flex-ai-center');
      div.id = room.broadcaster;
      const buttonElement = document.createElement('button');
      buttonElement.classList.add('join', 'width-100', 'my-16', 'sb-btn', 'sb-btn-secondary', 'sb-btn-normal');
      buttonElement.id = room.roomToken;
      buttonElement.innerHTML = `JOIN Room - ${room.roomName}`;
      div.appendChild(buttonElement);
      this.showLoader = false;
      this.roomsList.insertBefore(div, this.roomsList.firstChild);
      div.onclick = () => {
        this.captureUserMedia(() => {
          this.broadcastUI.joinRoom({
            roomToken: div.querySelector('.join').id,
            joinUser: div.id
          });
        });
        this.hideUnnecessaryStuff();
      };
    }
  };

  constructor(private broadcastService: WebrtcBroadcastService, public loginService: LoginService,
    private contentService: ContentServiceService, private toasterService: ToasterService, private router: Router) {
    this.broadcastUI = this.broadcastService.broadcast(this.config);
  }

  endRecording() {
    this.disableDownloadButton = false;
    if (_.get(window, 'stopRecordingStream')) {
      window['stopRecordingStream']();
    }
  }

  downloadRecording() {
    this.disableEndRecordStreamButton = true;
    if (_.get(window, 'downloadRecordingStream')) {
      window['downloadRecordingStream']();
    }

    this.uploadContent();

  }

  uploadContent() {
    const fileName = 'test.webm';
    const sessionDetails = _.get(this.sessionDetails, 'sessionDetails');
    const contentId = _.get(this.sessionDetails, 'newContentId');
    this.contentService.uploadContent({ fileName: fileName, contentId: contentId }).pipe(
      switchMap((res: any) => {
        const signedUrl = _.get(res, 'result.pre_signed_url');
        const recordedBlobs: [] = window['returnRecordedBlobs']() || [];
        if (recordedBlobs.length) {
          return this.contentService.uploadFile({ url: signedUrl, contentData: recordedBlobs, fileName: fileName }).pipe(
            mergeMap(res => {
              return this.contentService.updateContentWithVideo(signedUrl.split('?')[0], contentId);
            })
          ).pipe(
            mergeMap(res => {
              return this.contentService.addResourceToHierarchy({ rootId: _.get(sessionDetails, 'contentId'), unitId: _.get(sessionDetails, 'textbookunit'), children: [contentId] })
            })
          );
        } else {
          return throwError('failed to upload recording. Please try again later...');
        }
      })
    )
      .pipe(
        retry(1)
      )
      .subscribe(
        res => {
          const url = `https://devcon.sunbirded.org/play/content/${contentId}?contentType=CoachingSession`;
          window.open(url, '_blank');
          console.log('Result from content upload api', res);
          this.toasterService.info('Recording has been successfully uploaded.');
        },
        err => {
          console.log('Upload failed', err);
          this.toasterService.error('Failed to upload video. Pleae try again Later...');
        }
      )
  }


  ngOnInit() {
    if (!window.location.hash.replace('#', '').length) {
      window.location.href = window.location.href.split('#')[0] + '#' + (Math.random() * 100).toString().replace('.', '');
      window.location.reload();
    }
    console.warn('Reading State', history.state);
    this.sessionDetails = _.get(window, 'history.state');
    if (this.sessionDetails.sessionDetails) {
      this.contentDetails$ = this.contentService.getCollectionHierarchy(this.sessionDetails.sessionDetails.contentId);
      this.propertiesToshow = _.pick(this.sessionDetails.sessionDetails, ['name', 'description', 'creator', 'startdate', 'endDate']);
    }
    this.participants = document.getElementById("participants") || document.body;
    this.startConferencing = document.getElementById('start-conferencing');
    this.roomsList = document.getElementById('rooms-list');
  }

  createButtonClickHandler() {
    this.captureUserMedia(() => {
      this.broadcastUI.createRoom({
        roomName: (<HTMLInputElement>document.getElementById('conference-name')).value || 'Anonymous'
      });
    });
    this.hideUnnecessaryStuff();
  }

  captureUserMedia(callback) {
    const div = document.createElement('div');
    div.classList.add('video-play');
    var video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('controls', 'true');
    div.appendChild(video);
    this.participants.insertBefore(div, this.participants.firstChild);

    this.getUserMedia({
      video: video,
      onsuccess: (stream) => {
        if (_.get(window, 'handleSuccess')) {
          window['handleSuccess'](stream);
        }
        this.disableEndRecordStreamButton = false;
        this.config['attachStream'] = stream;
        callback && callback();
        video.setAttribute('muted', "true");
        this.rotateVideo(video);
      },
      onerror: function () {
        alert('unable to get access to your webcam.');
        callback && callback();
      }
    });
  }

  getUserMedia(options) {
    var video_constraints = {
      mandatory: {},
      optional: []
    };

    navigator.mediaDevices.getUserMedia(options.constraints || {
      audio: true,
      video: video_constraints
    }).then(function (stream) {
      var video = options.video;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
      options.onsuccess && options.onsuccess(stream);
    }).catch(function (e) {
      alert(e.message || JSON.stringify(e));
    });
  }


  hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
      length = visibleElements.length;
    for (var i = 0; i < length; i++) {
      visibleElements[i]['style']['display'] = 'none';
    }
    this.addClass = true;
  }

  rotateVideo(video) {
    video.style[navigator['mozGetUserMedia'] ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
      video.style[navigator['mozGetUserMedia'] ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
  }


}
