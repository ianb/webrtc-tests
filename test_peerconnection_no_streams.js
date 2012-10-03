// I'm not sure how this is actually *supposed* to work, but I'm
// documenting what I'm seeing, which may or may not be correct.

var conn1 = new RTCPeerConnection();
var conn2 = new RTCPeerConnection();

// Note: no streams are added to anything

var conn1Offer;

conn1.createOffer(Spy('conn1.createOffer', function (offer) {
  conn1.setLocalDescription(offer, Spy('conn1.setLocalDescription', function () {
    conn1Offer = offer;
  }), Spy('conn1.setLocalDescription/failure'));
}), Spy('conn1.createOffer/failure'));

Spy('conn1.setLocalDescription').wait();

/* =>
conn1.createOffer({
  sdp: "v=0...",
  type: "offer"
})
conn1.setLocalDescription(0)
*/

// Now, we get to the part where it doesn't work:


conn2.setRemoteDescription(conn1Offer, Spy('conn2.setRemoteDescription', function () {
  conn2.createAnswer(conn1Offer, Spy('conn2.createAnswer', function (answer) {
    conn2.setLocalDescription(answer, Spy('conn2.setLocalDescription', function () {
      conn1.setRemoteDescription(answer, Spy('conn1.setRemoteDescription', function () {
        print('done!');
      }), Spy('conn1.setRemoteDescription/failure'));
    }), Spy('conn2.setLocalDescription/failure'));
  }), Spy('conn2.createAnswer/failure'));
}), Spy('conn2.setRemoteDescription/failure'));

Spy('conn2.setRemoteDescription/failure').wait();

// FIXME: is this okay?
/* =>
conn2.setRemoteDescription/failure(8)
*/
