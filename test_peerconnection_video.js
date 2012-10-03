// = SECTION Setup first connection

var conn1 = new RTCPeerConnection();
var conn2 = new RTCPeerConnection();

print(conn1);

// => ...

Spy.on('conn1.onConnection');
Spy.on('conn1.onClosedConnection');
/*Spy.on('conn1.onRemoteStreamAdded', function (obj) {
  var video = document.getElementById('video1');
  video.src = obj.stream;
  video.play();
});*/
Spy.on('conn2.onConnection');
Spy.on('conn2.onClosedConnection');
/*Spy.on('conn2.onRemoteStreamAdded', function (obj) {
  var video = document.getElementById('video2');
  video.src = obj.stream;
  video.play();
});*/

navigator.mozGetUserMedia({video: true}, Spy('mozGetUserMedia', function (stream) {
  //conn1.addStream(stream);
  conn1.addStream(conn1.createFakeMediaStream('audio'));
  //conn2.addStream(stream);
  conn2.addStream(conn2.createFakeMediaStream('audio'));
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

// FIXME: this is broken:
//print(conn1.localDescription);

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

/* =>
conn2.setRemoteDescription(0)
conn2.createAnswer({
  sdp: "v=0...",
  type: "answer"
})
conn2.setLocalDescription(0)
conn1.setRemoteDescription(0)
*/
