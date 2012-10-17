var local = new RTCPeerConnection();
print(local);

// FIXME: as you can see, this is not good:
/* =>
[RTCPeerConnection
  readyState: ("undefined") (invalid readyState)
  iceState: ("undefined") (invalid iceState)
  iceGatheringState: ("undefined") (invalid iceGatheringState)
  no localStreams
  no remoteStreams
]
*/

// FIXME: this should be true
print(local instanceof RTCPeerConnection);
// => false

navigator.mozGetUserMedia({audio: true, fake: true}, function () {});

// FIXME: this shouldn't be an error, filed: https://bugzilla.mozilla.org/show_bug.cgi?id=802835
// => Error: [Exception...Not enough arguments [nsIDOMNavigatorUserMedia.mozGetUserMedia]...

var audioStream;
navigator.mozGetUserMedia({audio: true, fake: true}, Spy('mozGetUserMedia', function (stream) {
  audioStream = stream;
}), Spy('mozGetUserMedia/failed'));

Spy('mozGetUserMedia').wait();

// => mozGetUserMedia([object MediaStream])

local.addStream(audioStream);

print({
  audioTracks: audioStream.audioTracks,
  label: audioStream.label,
  readyState: audioStream.readyState,
  videoTracks: audioStream.videoTracks
});

// FIXME: these should all exist
/* =>
{
  audioTracks: undefined,
  label: undefined,
  readyState: undefined,
  videoTracks: undefined
}
*/

var remoteAudioStream;
navigator.mozGetUserMedia({audio: true, fake: true}, Spy('mozGetUserMedia', function (stream) {
  remoteAudioStream = stream;
}), Spy('mozGetUserMedia/failed'));
Spy('mozGetUserMedia').wait();

// => ...

// FIXME: I don't believe any of the other track stuff is working as in the spec

var remote = new RTCPeerConnection();
remote.addStream(remoteAudioStream);

// =>

var localOffer = null;

local.createOffer(Spy('local.createOffer', function (offer) {
  local.setLocalDescription(offer, Spy('local.setLocalDescription', function () {
    localOffer = offer;
  }), Spy('local.setLocalDescription/failed'));
}), Spy('local.ceateOffer/failed'));

Spy('local.setLocalDescription').wait(10000);

// FIXME: setLocalDescription should get no arguments
/* =>
local.createOffer({
  sdp: "v=0...",
  type: "offer"
})
local.setLocalDescription(0)
*/

print(local);

// FIXME: this should show localDescription
// => [RTCPeerConnection...]

var remoteAnswer = null;

remote.setRemoteDescription(localOffer, Spy('remote.setRemoteDescription', function () {
  remote.createAnswer(localOffer, Spy('remote.createAnswer', function (answer) {
    remote.setLocalDescription(answer, Spy('remote.setLocalDescription', function () {
      remoteAnswer = answer;
    }), Spy('remote.setLocalDescription/failed'));
  }), Spy('remote.createAnswer/failed'));
}), Spy('remote.setRemoteDescription/failed'));

Spy('remote.setLocalDescription').wait(15000);

// FIXME: no argument to setRemoteDescription, setLocalDescription
/* =>
remote.setRemoteDescription(0)
remote.createAnswer({
  sdp: "v=0...",
  type: "answer"
})
remote.setLocalDescription(0)
*/

print(remote);

// FIXME: this should show remoteDescription and localDescription
// => [RTCPeerConnection...]

local.setRemoteDescription(
  remoteAnswer,
  Spy('local.setRemoteDescription'),
  Spy('local.setRemoteDescription/failed'));

Spy('local.setRemoteDescription').wait();

/* =>
local.setRemoteDescription(0)
*/

print(local);
// FIXME: again, no remoteDescription
// => [RTCPeerConnection...]
