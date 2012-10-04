// = SECTION Setup first connection

var conn1 = new RTCPeerConnection();
var conn2 = new RTCPeerConnection();

print(conn1);

// => ...

// FIXME: never fires:
Spy.on('conn1.onstatechange');
// onConnection is an old name
// Also doesn't seem to work
Spy.on('conn1.onConnection');
// FIXME: onopen is not implemented
//Spy.on('conn1.onopen');
// onCloseConnection is an old name
// Also doesn't seem to work
Spy.on('conn1.onClosedConnection');
// FIXME: onclose is not implemented
//Spy.on('conn1.onclose');
Spy.on('conn1.onaddstream');
Spy.on('conn1.onremovestream');
Spy.on('conn1.ongatheringchange');
//Spy.on('conn1.onnegotiationneeded');
Spy.on('conn1.onicecandidate');
Spy.on('conn1.onicechange');

Spy.on('conn2.onstatechange');
Spy.on('conn2.onConnection');
//Spy.on('conn2.onopen');
Spy.on('conn2.onClosedConnection');
//Spy.on('conn2.onclose');
Spy.on('conn2.onaddstream');
Spy.on('conn2.onremovestream');
Spy.on('conn2.ongatheringchange');
//Spy.on('conn2.onnegotiationneeded');
Spy.on('conn2.onicecandidate');
Spy.on('conn2.onicechange');

var conn1Stream, conn2Stream;

navigator.mozGetUserMedia({video: true}, Spy('mozGetUserMedia', function (stream) {
  // FIXME: if I add this stream (instead of the fake stream), I get an 8 error
  //conn1.addStream(stream);
  conn1.addStream(conn1Stream = conn1.createFakeMediaStream('audio'));
  // FIXME: this seems to do nothing
  Spy.on('conn1Stream.onended');
  //conn2.addStream(stream);
  conn2.addStream(conn2Stream = conn2.createFakeMediaStream('audio'));
  Spy.on('conn1Stream.onended');
}, {wait: true}), Spy('navigator.mozGetUserMedia/failed'));

/* =>
mozGetUserMedia([object MediaStream])
*/

// = SECTION Connect the connections

var conn1Offer;

conn1.createOffer(Spy('conn1.createOffer', function (offer) {
  conn1.setLocalDescription(offer, Spy('conn1.setLocalDescription', function () {
    conn1Offer = offer;
  }), Spy('conn1.setLocalDescription/failed'));
}), Spy('conn1.createOffer/failed'));

Spy('conn1.setLocalDescription').wait();

/* =>
conn1.createOffer({
  sdp: "v=0...",
  type: "offer"
})
conn1.setLocalDescription(0)
*/

conn2.setRemoteDescription(conn1Offer, Spy('conn2.setRemoteDescription', function () {
  conn2.createAnswer(conn1Offer, Spy('conn2.createAnswer', function (answer) {
    conn2.setLocalDescription(answer, Spy('conn2.setLocalDescription', function () {
      conn1.setRemoteDescription(answer, Spy('conn1.setRemoteDescription', function () {
      }), Spy('conn1.setRemoteDescription/failed'));
    }), Spy('conn2.setLocalDescription/failed'));
  }), Spy('conn2.createAnswer/failed'));
}), Spy('conn2.setRemoteDescription/failed'));

Spy('conn1.setRemoteDescription').wait();

// My reading of the spec would indicate that onaddstream should be
// called before the setRemoteDescription callback
/* =>
conn2.onaddstream({stream: [object MediaStream], type: "audio"})
conn2.setRemoteDescription(0)
conn2.createAnswer({
  sdp: "v=0...",
  type: "answer"
})
conn2.setLocalDescription(0)
conn1.onaddstream({stream: [object MediaStream], type: "audio"})
conn1.setRemoteDescription(0)
*/

print(conn1);
print(conn2);

// FIXME: localStreams and remoteStreams are not defined
/* =>
[RTCPeerConnection
  readyState: ("undefined") (invalid readyState)
  iceState: ("undefined") (invalid iceState)
  iceGatheringState: ("undefined") (invalid iceGatheringState)
  invalid undefined localStreams
  invalid undefined remoteStreams
]
[RTCPeerConnection
  readyState: ("undefined") (invalid readyState)
  iceState: ("undefined") (invalid iceState)
  iceGatheringState: ("undefined") (invalid iceGatheringState)
  invalid undefined localStreams
  invalid undefined remoteStreams
]
*/

conn1.addStream(conn1Stream);

// FIXME: this shouldn't be an error
// => Error: [Exception...]

var conn1SecondStream = conn1.createFakeMediaStream('video');

conn1.addStream(conn1SecondStream);
wait(1000);

// FIXME: this should do something, like conn2.onaddstream
// =>

conn1.removeStream(conn1Stream);
wait(1000);

// FIXME: this should fire onremovestream
// =>

conn1.close();
wait(1000);

// FIXME: this should do something
// =>

conn1.close();

// FIXME: this should throw INVALID_STATE_ERR
// =>
