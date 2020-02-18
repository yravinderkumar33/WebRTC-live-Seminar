import { Component, OnInit } from '@angular/core';
import { WebrtcBroadcastService } from '../../services/webrtc-broadcast.service';

@Component({
  selector: 'app-webinar',
  templateUrl: './webinar.component.html',
  styleUrls: ['./webinar.component.css']
})
export class WebinarComponent implements OnInit {



  broadcastUI;
  participants
  startConferencing
  roomsList

  config = {
    openSocket: function (config) {
      var SIGNALING_SERVER = 'https://localhost:9559/';
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
      this.participants.insertBefore(video, this.participants.firstChild);
      video.play();
      this.rotateVideo(video);
    },
    onRoomFound: (room) => {
      var alreadyExist = document.getElementById(room.broadcaster);
      if (alreadyExist) return;
      if (typeof this.roomsList === 'undefined') this.roomsList = document.body;
      var tr = document.createElement('tr');
      tr.setAttribute('id', room.broadcaster);
      tr.innerHTML = '<td>' + room.roomName + '</td>' +
        '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
      this.roomsList.insertBefore(tr, this.roomsList.firstChild);
      tr.onclick = () => {
        this.captureUserMedia(() => {
          this.broadcastUI.joinRoom({
            roomToken: tr.querySelector('.join').id,
            joinUser: tr.id
          });
        });
        this.hideUnnecessaryStuff();
      };
    }
  };
  
  constructor(private broadcastService: WebrtcBroadcastService) {
    this.broadcastUI = this.broadcastService.broadcast(this.config);
  }
  ngOnInit() {
    if (!window.location.hash.replace('#', '').length) {
      window.location.href = window.location.href.split('#')[0] + '#' + (Math.random() * 100).toString().replace('.', '');
      window.location.reload();
    }
    this.participants = document.getElementById("participants") || document.body;
    this.startConferencing = document.getElementById('start-conferencing');
    this.roomsList = document.getElementById('rooms-list');

    // if (this.startConferencing) this.startConferencing.onclick = this.createButtonClickHandler;
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
    var video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('controls', 'true');
    this.participants.insertBefore(video, this.participants.firstChild);

    this.getUserMedia({
      video: video,
      onsuccess: (stream) => {
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
  }

  rotateVideo(video) {
    video.style[navigator['mozGetUserMedia'] ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
      video.style[navigator['mozGetUserMedia'] ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
  }


}
