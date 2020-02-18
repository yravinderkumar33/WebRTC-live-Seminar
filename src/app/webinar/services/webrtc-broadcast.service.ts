import { Injectable } from '@angular/core';


/*
RTC Code starts
*/

if (typeof window['RTCPeerConnection'] !== 'undefined') {
  window['RTCPeerConnection00'] = window['RTCPeerConnection'];
} else if (typeof window['mozRTCPeerConnection'] !== 'undefined') {
  window['RTCPeerConnection00'] = window['mozRTCPeerConnection'];
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
  window['RTCPeerConnection00'] = webkitRTCPeerConnection;
}

var RTCPeerConnection = function (options) {
  var w = window;

  var RTCSessionDescription = window['RTCSessionDescription'] || window['mozRTCSessionDescription'];
  var RTCIceCandidate = window['RTCIceCandidate'] || window['mozRTCIceCandidate'];
  var MediaStreamTrack = window['MediaStreamTrack'];

  var peer = new window['RTCPeerConnection00']({
    iceServers: IceServersHandler.getIceServers()
  });

  openOffererChannel();

  peer.onicecandidate = function (event) {
    if (event.candidate)
      options.onICE(event.candidate);
  };

  if (peer.addTrack === 'function') {
    // attachStream = MediaStream;
    if (options.attachStream) {
      options.attachStream.getTracks().forEach(function (track) {
        peer.addTrack(track, options.attachStream);
      });
    }

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
      var streams = options.attachStreams;
      for (var i = 0; i < streams.length; i++) {
        streams[i].getTracks().forEach(function (track) {
          peer.addTrack(track, streams[i]);
        });
      }
    }

    var dontDuplicate = {};
    peer.ontrack = function (event) {
      var remoteMediaStream = event.streams[0];

      if (dontDuplicate[remoteMediaStream.id]) return;
      dontDuplicate[remoteMediaStream.id] = true;

      // onRemoteStreamEnded(MediaStream)
      remoteMediaStream.onended = remoteMediaStream.oninactive = function () {
        if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
      };

      // onRemoteStream(MediaStream)
      if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

      console.debug('on:add:stream', remoteMediaStream);
    };
  }
  else {
    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
      var streams = options.attachStreams;
      for (var i = 0; i < streams.length; i++) {
        peer.addStream(streams[i]);
      }
    }

    peer.onaddstream = function (event) {
      var remoteMediaStream = event.stream;

      // onRemoteStreamEnded(MediaStream)
      remoteMediaStream.onended = function () {
        if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
      };

      // onRemoteStream(MediaStream)
      if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

      console.debug('on:add:stream', remoteMediaStream);
    };
  }

  var constraints = options.constraints || {
    optional: [],
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    }
  };

  console.debug('sdp-constraints', JSON.stringify(constraints.mandatory, null, '\t'));

  // onOfferSDP(RTCSessionDescription)

  function createOffer() {
    if (!options.onOfferSDP) return;

    peer.createOffer(constraints).then(function (sessionDescription) {
      peer.setLocalDescription(sessionDescription).then(function () {
        options.onOfferSDP(sessionDescription);
        console.debug('offer-sdp', sessionDescription.sdp);
      });
    }).catch(onSdpError);
  }

  // onAnswerSDP(RTCSessionDescription)

  function createAnswer() {
    if (!options.onAnswerSDP) return;

    //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
    console.debug('offer-sdp', options.offerSDP.sdp);
    peer.setRemoteDescription(new RTCSessionDescription(options.offerSDP)).then(function () {
      peer.createAnswer(constraints).then(function (sessionDescription) {
        peer.setLocalDescription(sessionDescription).then(function () {
          options.onAnswerSDP(sessionDescription);
          console.debug('answer-sdp', sessionDescription.sdp);
        });
      }).catch(onSdpError);
    }).catch(onSdpError);
  }

  // if Mozilla Firefox & DataChannel; offer/answer will be created later
  if ((options.onChannelMessage && !window['moz']) || !options.onChannelMessage) {
    createOffer();
    createAnswer();
  }

  // DataChannel management
  var channel;

  function openOffererChannel() {
    if (!options.onChannelMessage)
      return;

    _openOffererChannel();
  }

  function _openOffererChannel() {
    // protocol: 'text/chat', preset: true, stream: 16
    // maxRetransmits:0 && ordered:false
    var dataChannelDict = {};
    channel = peer.createDataChannel(options.channel || 'sctp-channel', dataChannelDict);
    setChannelEvents();
  }

  function setChannelEvents() {
    channel.onmessage = function (event) {
      if (options.onChannelMessage) options.onChannelMessage(event);
    };

    channel.onopen = function () {
      if (options.onChannelOpened) options.onChannelOpened(channel);
    };
    channel.onclose = function (event) {
      if (options.onChannelClosed) options.onChannelClosed(event);

      console.warn('WebRTC DataChannel closed', event);
    };
    channel.onerror = function (event) {
      if (options.onChannelError) options.onChannelError(event);

      console.error('WebRTC DataChannel error', event);
    };
  }

  if (options.onAnswerSDP && options.onChannelMessage) {
    openAnswererChannel();
  }

  function openAnswererChannel() {
    peer.ondatachannel = function (event) {
      channel = event.channel;
      setChannelEvents();
    };
  }

  // fake:true is also available on chrome under a flag!

  function useless() {
    console.error('Error in fake:true');
  }

  function onSdpSuccess() {
  }

  function onSdpError(e) {
    var message = JSON.stringify(e, null, '\t');

    if (message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
      message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
    }

    console.error('onSdpError:', message);
  }

  return {
    addAnswerSDP: function (sdp) {
      console.debug('adding answer-sdp', sdp.sdp);
      peer.setRemoteDescription(new RTCSessionDescription(sdp));
    },
    addICE: function (candidate) {
      peer.addIceCandidate(new RTCIceCandidate({
        sdpMLineIndex: candidate.sdpMLineIndex,
        candidate: candidate.candidate
      }));

      console.debug('adding-ice', candidate.candidate);
    },

    peer: peer,
    channel: channel,
    sendData: function (message) {
      channel && channel.send(message);
    }
  };
}

window['moz'] = !!navigator['mozGetUserMedia'];
var chromeVersion = 70;
try {
  chromeVersion = !!navigator['mozGetUserMedia'] ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
}
catch (e) { }

// IceServersHandler.js

var IceServersHandler = (function () {
  function getIceServers(connection?) {
    // resiprocate: 3344+4433
    // pions: 7575
    var iceServers = [{
      'urls': [
        'stun:webrtcweb.com:7788', // coTURN
        'stun:webrtcweb.com:7788?transport=udp', // coTURN
      ],
      'username': 'muazkh',
      'credential': 'muazkh'
    },
    {
      'urls': [
        'turn:webrtcweb.com:7788', // coTURN 7788+8877
        'turn:webrtcweb.com:4455?transport=udp', // restund udp

        'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
        'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
      ],
      'username': 'muazkh',
      'credential': 'muazkh'
    },
    {
      'urls': [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
      ]
    }
    ];

    if (typeof window['InstallTrigger'] !== 'undefined') {
      iceServers = [{
        'urls': [
          'turn:webrtcweb.com:7788',
          'stun:webrtcweb.com:7788',
        ],
        'username': 'muazkh',
        'credential': 'muazkh'
      }];
    }

    return iceServers;
  }

  return {
    getIceServers: getIceServers
  };
})();

// RTC code ends //

@Injectable({
  providedIn: 'root'
})
export class WebrtcBroadcastService {

  private _isbroadCaster: boolean;

  get isBroadcaster(): boolean {
    return this._isbroadCaster;
  }

  set isBroadCaster(flag: boolean) {
    this._isbroadCaster = flag;
  }

  constructor() {
    this.isBroadCaster = true;
  }

  public broadcast = (config) => {
    var self: any = {
      userToken: uniqueToken()
    },
      channels = '--',
      isbroadcaster,
      isGetNewRoom = true,
      defaultSocket = {};

    function openDefaultSocket() {
      defaultSocket = config.openSocket({
        onmessage: onDefaultSocketResponse,
        callback: function (socket) {
          defaultSocket = socket;
        }
      });
    }

    const onDefaultSocketResponse = (response) => {
      this._isbroadCaster = false;
      if (response.userToken == self.userToken) return;
      if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);
      if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
        channels += response.userToken + '--';
        openSubSocket({
          isofferer: true,
          channel: response.channel || response.userToken,
          closeSocket: true
        });
      }
    }

    function openSubSocket(_config) {
      if (!_config.channel) return;
      var socketConfig = {
        channel: _config.channel,
        onmessage: socketResponse,
        onopen: function () {
          if (isofferer && !peer) initPeer();
        }
      };

      socketConfig['callback'] = function (_socket) {
        socket = _socket;
        this.onopen();
      };

      var socket = config.openSocket(socketConfig),
        isofferer = _config.isofferer,
        gotstream,
        video = document.createElement('video'),
        inner: any = {},
        peer;

      var peerConfig = {
        attachStream: config.attachStream,
        onICE: function (candidate) {
          socket.send({
            userToken: self.userToken,
            candidate: {
              sdpMLineIndex: candidate.sdpMLineIndex,
              candidate: JSON.stringify(candidate.candidate)
            }
          });
        },
        onRemoteStream: function (stream) {
          if (!stream) return;

          video.srcObject = stream;
          video.play();

          _config.stream = stream;
          onRemoteStreamStartsFlowing();
        }
      };

      function initPeer(offerSDP?) {
        if (!offerSDP) {
          peerConfig['onOfferSDP'] = sendsdp;
        } else {
          peerConfig['offerSDP'] = offerSDP;
          peerConfig['onAnswerSDP'] = sendsdp;
        }

        peer = RTCPeerConnection(peerConfig);
      }

      function afterRemoteStreamStartedFlowing() {
        gotstream = true;

        config.onRemoteStream({
          video: video,
          stream: _config.stream
        });

        /* closing subsocket here on the offerer side */
        if (_config.closeSocket) socket = null;
      }

      function onRemoteStreamStartsFlowing() {
        if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i)) {
          // if mobile device
          return afterRemoteStreamStartedFlowing();
        }

        if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
          afterRemoteStreamStartedFlowing();
        } else setTimeout(onRemoteStreamStartsFlowing, 50);
      }

      function sendsdp(sdp) {
        sdp = JSON.stringify(sdp);
        var part = +(sdp.length / 3);

        var firstPart = sdp.slice(0, part),
          secondPart = sdp.slice(part, sdp.length - 1),
          thirdPart = '';

        if (sdp.length > part + part) {
          secondPart = sdp.slice(part, part + part);
          thirdPart = sdp.slice(part + part, sdp.length);
        }

        socket.send({
          userToken: self.userToken,
          firstPart: firstPart
        });

        socket.send({
          userToken: self.userToken,
          secondPart: secondPart
        });

        socket.send({
          userToken: self.userToken,
          thirdPart: thirdPart
        });
      }

      function socketResponse(response) {
        if (response.userToken == self.userToken) return;
        if (response.firstPart || response.secondPart || response.thirdPart) {
          if (response.firstPart) {
            inner.firstPart = response.firstPart;
            if (inner.secondPart && inner.thirdPart) selfInvoker();
          }
          if (response.secondPart) {
            inner.secondPart = response.secondPart;
            if (inner.firstPart && inner.thirdPart) selfInvoker();
          }

          if (response.thirdPart) {
            inner.thirdPart = response.thirdPart;
            if (inner.firstPart && inner.secondPart) selfInvoker();
          }
        }

        if (response.candidate && !gotstream) {
          peer && peer.addICE({
            sdpMLineIndex: response.candidate.sdpMLineIndex,
            candidate: JSON.parse(response.candidate.candidate)
          });
        }
      }

      var invokedOnce = false;

      function selfInvoker() {
        if (invokedOnce) return;

        invokedOnce = true;

        inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
        if (isofferer) peer.addAnswerSDP(inner.sdp);
        else initPeer(inner.sdp);
      }
    }

    const startBroadcasting = () => {
      this._isbroadCaster = true;
      defaultSocket && defaultSocket['send']({
        roomToken: self.roomToken,
        roomName: self.roomName,
        broadcaster: self.userToken
      });
      setTimeout(startBroadcasting, 3000);
    }

    function uniqueToken() {
      var s4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
      };
      return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
      createRoom: (_config) => {
        self.roomName = _config.roomName || 'Anonymous';
        self.roomToken = uniqueToken();

        isbroadcaster = true;
        isGetNewRoom = false;
        this._isbroadCaster = true;
        startBroadcasting();
      },
      joinRoom: (_config) => {
        this._isbroadCaster = false;
        self.roomToken = _config.roomToken;
        isGetNewRoom = false;

        openSubSocket({
          channel: self.userToken
        });

        defaultSocket['send']({
          participant: true,
          userToken: self.userToken,
          joinUser: _config.joinUser
        });
      }
    };
  };

}
