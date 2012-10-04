/* These are intended to test the data channel, but I can't get that part working */

print(RTCPeerConnection());

// FIXME: I think this should be an error
// => ...

var conn1 = new RTCPeerConnection();
var channel1;
var conn1Offer;

print(conn1);

// => ...

conn1.onDataChannel = function (channel) {
  print('Got channel1', channel);
  print('conn1 readyState', conn1.readyState);
  print('.binaryType =', channel.binaryType);
  channel1 = channel;
  channel1.onmessage = function (event) {
    if (event.data instanceof Blob) {
      print('channel1 blob size:', event.data.size);
    } else {
      print('channel1 text size:', event.data.length, 'data:', event.data);
    }
  };
  Spy.on(channel1, 'channel1.onopen');
  Spy.on(channel1, 'channel1.onclose');
};

Spy.on('conn1.onConnection');
Spy.on('conn1.onClosedConnection');
conn1.addStream(conn1.createFakeMediaStream("audio", true));
Spy.on('conn1.onaddstream');

conn1.createOffer(Spy('conn1.createOffer', function (offer) {
  conn1.setLocalDescription(offer, Spy('conn1.setLocalDescription', function () {
    conn1Offer = offer;
  }), Spy('conn1.setLocalDescription/failed'));
}), Spy('conn1.createOffer/failure'));

Spy('conn1.setLocalDescription').wait();

/* =>
conn1.createOffer({
  sdp: "v=0\r\n...",
  type: "offer"
})
conn1.setLocalDescription(0)
*/

var conn2 = new RTCPeerConnection();
var channel2;

conn2.onDataChannel = function (channel) {
  print('Got channel2', channel);
  print('conn2 readyState', conn2.readyState);
  print('.binaryType =', channel.binaryType);
  channel2 = channel;
  channel2.onmessage = function (event) {
    if (event.data instanceof Blob) {
      print('channel2 blob size:', event.data.size);
    } else {
      print('channel2 text size:', event.data.length, 'data:', event.data);
    }
  };
  Spy.on(channel2, 'channel2.onopen');
  Spy.on(channel2, 'channel2.onclose');
};

// =>

Spy.on('conn2.onConnection');
Spy.on('conn2.onClosedConnection');
conn2.addStream(conn2.createFakeMediaStream("audio", true));
Spy.on('conn2.onaddstream');
conn2.setRemoteDescription(conn1Offer, Spy('conn2.setRemoteDescription', function () {
  conn2.createAnswer(conn1Offer, Spy('conn2.createAnswer', function (answer) {
    conn2.setLocalDescription(answer, Spy('conn2.setLocalDescription', function () {
      conn1.setRemoteDescription(answer, Spy('conn1.setRemoteDescription', function () {
        //print(conn1.createDataChannel("chat", {outOfOrderAllowed: false, maxRetransmitTime: 1000}));
        //print(conn2.createDataChannel("chat", {outOfOrderAllowed: false, maxRetransmitTime: 1000}));
        print(conn1.createDataChannel("chat", {}));
        // FIXME: these aren't in the spec?
        conn1.connectDataConnection(5000, 5001);
        conn2.connectDataConnection(5001, 5000);
      }), Spy('conn1.setRemoteDescription/failed'));
    }), Spy('conn1.setLocalDescription/failed'));
  }), Spy('conn2.createAnswer/failed'));
}), Spy('conn2.setRemoteDescription/failed'));

Spy('conn1.setRemoteDescription').wait();

/* =>
conn2.onaddstream({stream: [object MediaStream], type: "audio"})
conn2.setRemoteDescription(0)
conn2.createAnswer({
  sdp: "v=0\r\n...",
  type: "answer"
})
conn2.setLocalDescription(0)
conn1.onaddstream({stream: [object MediaStream], type: "audio"})
conn1.setRemoteDescription(0)
*/

/* =>
*/
