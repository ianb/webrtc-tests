var localaudio = document.getElementById("audio1");
var audio = document.getElementById("audio2");

var pc1;
var pc2;

var pc1_offer;
var pc2_answer;

var failed = Spy('failed');

pc1 = new RTCPeerConnection();
pc2 = new RTCPeerConnection();

Spy.on('pc1.onaddstream');
Spy.on('pc1.onremovestream');
Spy.on('pc2.onaddstream');
Spy.on('pc2.onremovestream');

var pc1Stream;
pc1.addStream(pc1Stream = pc1.createFakeMediaStream("audio"));
pc2.addStream(pc2.createFakeMediaStream("audio"));

print('pc1', pc1.localStreams);
print('pc2', pc2.localStreams);

// FIXME: obviously this isn't what these should be:
/* =>
pc1 undefined
pc2 undefined
*/

pc1.createOffer(Spy('pc1.createOffer', function (offer) {
  pc1_offer = offer;
  pc1.setLocalDescription(offer, Spy('pc1.setLocalDescription', function () {
    pc2.setRemoteDescription(pc1_offer, Spy('pc2.setRemoteDescription', function () {
      pc2.createAnswer(pc1_offer, Spy('pc2.createAnswer', function (answer) {
        pc2_answer = answer;
        pc2.setLocalDescription(answer, Spy('pc2.setLocalDescription', function () {
          pc1.setRemoteDescription(
            pc2_answer,
            Spy('pc1.setRemoteDescription'),
            Spy('pc1.setRemoteDescription/failed'));
        }), Spy('pc2.setLocalDescription/failed'));
      }), Spy('pc2.createAnswer/failed'));
    }), Spy('pc2.setRemoteDescription/failed'));
  }), Spy('pc1.setLocalDescription/failed'));
}), Spy('pc1.createOffer/failed'));

function stop() {
  pc1.close();
  pc2.close();
}

Spy('pc1.setRemoteDescription').wait();

/* =>
pc1.createOffer({
  sdp: "v=0...",
  type: "offer"
})
pc1.setLocalDescription(0)
pc2.onaddstream({stream: [object MediaStream], type: "audio"})
pc2.setRemoteDescription(0)
pc2.createAnswer({
  sdp: "v=0...",
  type: "answer"
})
pc2.setLocalDescription(0)
pc1.onaddstream({stream: [object MediaStream], type: "audio"})
pc1.setRemoteDescription(0)

*/

pc1.removeStream(pc1Stream);
//Spy('pc2.onremovestream').wait();

// FIXME: something should actually fire (in which case that commented out wait() would be useful)
// =>

// SECTION Misuse

var badPC = new RTCPeerConnection();
badPC.setLocalDescription('invalid', Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));

// => Error: ...

badPC.createOffer(Spy('badPC.getOffer', function (offer) {
  offer.type = 'foo';
  badPC.setLocalDescription(offer, Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));
}), Spy('badPC.getOffer/failed'));

Spy('badPC.setLocalDescription/failed').wait();

/* =>
badPC.getOffer({
  sdp: "v=0...",
  type: "offer"
})
badPC.setLocalDescription/failed("Invalid type foo provided to setLocalDescription")
*/

var badPC = new RTCPeerConnection();
var saveOffer;

// FIXME: should it catch anything about this bad offer?  Or allow it?
badPC.createOffer(Spy('badPC.getOffer', function (offer) {
  saveOffer = {sdp: offer.sdp, type: offer.type};
  offer.sdp = offer.sdp.replace(/\=0/g, '=1');
  badPC.setLocalDescription(offer, Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));
}), Spy('badPC.getOffer/failed'));

Spy('badPC.setLocalDescription').wait();

/* =>
badPC.getOffer({
  sdp: "v=0...",
  type: "offer"
})
badPC.setLocalDescription(0)
*/

var badPC = new RTCPeerConnection();

var fakeOffer = {
  sdp: 'v=0\r\nblah blah',
  type: 'offer'
};
badPC.setLocalDescription(fakeOffer, Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));

Spy('badPC.setLocalDescription/failed').wait();

/* =>
badPC.setLocalDescription/failed(7)
*/

var badPC = new RTCPeerConnection();

var fakeOffer = {
  sdp: saveOffer.sdp
};
badPC.setLocalDescription(fakeOffer, Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));

Spy('badPC.setLocalDescription/failed').wait();

// => badPC.setLocalDescription/failed("Invalid type undefined provided to setLocalDescription")

var badPC = new RTCPeerConnection();

var fakeOffer = {
  type: saveOffer.type
};
badPC.setLocalDescription(fakeOffer, Spy('badPC.setLocalDescription'), Spy('badPC.setLocalDescription/failed'));

Spy('badPC.setLocalDescription/failed').wait();

// => badPC.setLocalDescription/failed(7)

var badPC = new RTCPeerConnection();

var fakeOffer = {
  type: saveOffer.type
};
badPC.setLocalDescription(fakeOffer, Spy('badPC.setLocalDescription'), null);

wait(100);

// =>

var badPC = new RTCPeerConnection();

badPC.createOffer({}, {});

wait(100);

// =>

var badPC = new RTCPeerConnection();

badPC.createOffer(Spy('badPC.createOffer1'), Spy('badPC.createOffer1/failed'));
badPC.createOffer(Spy('badPC.createOffer2'), Spy('badPC.createOffer2/failed'));
wait(function () {return Spy('badPC.createOffer1').called || Spy('badPC.createOffer2').called;});

// FIXME: this isn't correct (note two createOffer2's)
// sometimes this fails by only printing showing one createOffer2, due to a timing issue with the wait function.
/* =>
badPC.createOffer2({
  sdp: "v=0...",
  type: "offer"
})
badPC.createOffer2({
  sdp: "v=0...",
  type: "offer"
})
*/

var badPC = new RTCPeerConnection();

badPC.createOffer();

// Not sure if this should be a specific exception?
// => Exception: [Exception...]
