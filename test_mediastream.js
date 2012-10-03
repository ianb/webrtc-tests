/* Stuff to test:
= 4.2.1.2

mediaStream.label (set locally and remotely.)
mediaStream.label should be enforced to be unique to the source stream, and not unique otherwise (i.e., local and remote)
mediaStream.add(track) should not fire a local event
mediaStream.add(track) *should* fire an event remotely
.add() should add to mediaStream.audioTracks or mediaStream.videoTracks
.add() should remotely fire addtrack
.remove(track) should not fire a local event
.remove(track) should fire an event remotely
.remove() should update .audioTracks or .videoTracks
.remove( should fire removetrack


= 4.2.2

References between tracks and streams are strong.  Need to figure out what this means in the API.
When a remote stream is ended, each track the remote stream sent should get an ended event.
A remote track that is sent but data has not yet arrived, should have .readyState == 'muted' - maybe all tracks should be set as such when addtrack fires?
A track should be muted if the "local user agent disables the track"


= 4.3

Skipping DTMF


= 5

Check RTCPeerConnection's readyState (starts as "new")
Check PC's ice state (starts as "new")
Check localStreams is empty
Check remoteStreams is empty

icestate goes from:
- new
- gathering
- connected
- completed
- or failed
- Unclear what to do when it completes partially (e.g., gets an audio negotiation, but no video)
- When connected or completed, PC.readyState becomes "active"
- When failed, PC.onclose() called

Ordering of tracks (in .audioTracks or .videoTracks) should match locally and remotely

Streams are added to PC.remoteStreams
addstream is called for remote stream

Streams are removed from PC.remoteStreams
removestream event fired

Once a stream is being consumed from a remote source, if the remote source adds or removes a track then negotiationneeded should fire.


= 5.1

offer/answer types can be only "offer", "answer" and "pranswer"

Check the peer state attribute somehow:
- new
- have-local-offer
- have-local-pranswer
- have-remote-pranswer
- active
- closed


= 5.1.16

PC.createOffer does its thing
PC.createAnswer does its thing
  What happens when you call both?
  What happens when you call them multiple times?
PC.setLocalDescription does its thing
  PC.localDescription is updated (null to start)
  Invalid calls
  Multiple calls
PC.setRemoteDescription does its thing
  PC.remoteDescription is updated
  Invalid calls
  Multiple calls
  Should fire onaddstream soon after calling (before full negotiation; check some state?)
updateIce and addIceCandidate does something?
.iceGatheringState
  - "new", "gathering" or "complete"
  - calls ongatheringchange
.iceState
  - "starting", "checking", "connected", "completed", "failed", "disconnected", "closed"
localStreams and remoteStreams are updated
  these are live arrays
.addStream, .removeStream
  .addStream with constraints?
PC.createDataChannel perhaps?
.getStats?
.close()
.readyState
  - "new", "have-local-offer", "have-local-pranswer", "have-remote-pranswer", "active", "closed"


Events:
onnegotiationneeded
onicecandidate
onopen
  When is it called?
onstatechange
onaddstream
onremovestream
ongatheringchange
onicechange
onidentityresult?


Methods:
Not sure how to test addIceCandidate()
addStream():
  if readyState == closed, then throw INVALID_STATE_ERR
  if stream already in localStreams, ignore
  stream goes at end of localStreams
  What to do with constraints?
  Fire negotiationneeded event (even if not yet connected?)
  returns void

removeStream():
  like addStream() (closed, not found in localStreams)
  remove from localStreams
  fire negotiationneeded

close():
  if already closed, then throw INVALID_STATE_ERR
  get rid of ICE Agent (not sure how to detect?)
  readyState = closed
  returns void

createAnswer():
createOffer():
  success callback required
  failure and constraints not
  constraints can throw an exception if malformed.


QUESTIONS:

When does onended get fired? (4.2.1.2)
Is it okay if addtrack fires for a non-muted track? (4.2.2)
How does a local user agent disable a track? (4.2.2)
Is there anything in RTCPeerConnection(configuration) to be tested?  Specifically "configuration"? (5)
Not sure what values to expect for RTCPeerConnection.readyState (5) or ice state
In [5.1.2.1 Attributes] why are type and sdp nullable?
In [5.1.7 RTCPeerState Enum] is peer state an attribute somewhere?  Maybe these are attributes on the RTCPeerConnection object?
Note sure what to do with onicecandidate, or onicechange (5.1)
"This event handler, of event handler event type removestream, must be fired by all objects implementing the RTCPeerConnection interface. It is called any time a MediaStream is removed by the remote peer. This will be fired only as a result of setRemoteDescription." - that doesn't seem right?
How are constraints (in createAnswer) formatted?




*/

var pc = new RTCPeerConnection();
print(pc);

// FIXME: as you can see, this is not good:
/* =>
[RTCPeerConnection
  readyState: undefined (invalid readyState)
  iceState: undefined (invalid iceState)
  iceGatheringState: undefined (invalid iceGatheringState)
  invalid undefined localStreams
  invalid undefined remoteStreams
]
*/
