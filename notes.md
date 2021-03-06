# Testing notes

Each of these items is noted as:

**DONE**: tested, seems to work okay

**TODO**: NOT tested yet

**FIXME**: the IMPLEMENTATION needs to be fixed, either to fix the
  behavior or some prerequesite for testing the behavior is missing.

also FIXME in a test means that the implementation needs to be fixed
  (i.e., the test SHOULD NOT pass as it is, even though all tests
  generally pass)


The following are notes on testing organized by specification section:

## 4.2.1.2

Tracks do not seem to be usable or exist? **FIXME**

mediaStream.label (set locally and remotely.) **FIXME**

mediaStream.label should be enforced to be unique to the source
  stream, and not unique otherwise (i.e., local and remote) **FIXME**

mediaStream.add(track) should not fire a local event

mediaStream.add(track) *should* fire an event remotely

- .add() should add to mediaStream.audioTracks or mediaStream.videoTracks
- .add() should remotely fire addtrack
- .remove(track) should not fire a local event
- .remove(track) should fire an event remotely
- .remove() should update .audioTracks or .videoTracks
- .remove() should fire removetrack


## 4.2.2

References between tracks and streams are strong.  Need to figure out
  what this means in the API.  Cannot see tracks?  **FIXME**

When a remote stream is ended, each track the remote stream sent
  should get an ended event. **FIXME**: cannot end stream?

A remote track that is sent but data has not yet arrived, should have
  .readyState == 'muted' - maybe all tracks should be set as such when
  addtrack fires? **FIXME**: no readyState

A track should be muted if the "local user agent disables the track"
  **FIXME**: don't know how to mute


## 4.3

Skipping DTMF **TODO**


## 5

Check RTCPeerConnection's readyState (starts as "new") **FIXME**

Check PC's ice state (starts as "new") **FIXME**

Check localStreams is empty **FIXME**

Check remoteStreams is empty **FIXME**

icestate goes from: **FIXME** (no icestate)
- new
- gathering
- connected
- completed
- or failed
- Unclear what to do when it completes partially (e.g., gets an audio
  negotiation, but no video)
- When connected or completed, PC.readyState becomes "active"
- When failed, PC.onclose() called

Ordering of tracks (in .audioTracks or .videoTracks) should match
  locally and remotely **FIXME**: no .audioTracks/remoteStreams/etc

Streams are added to PC.remoteStreams **FIXME**

addstream is called for remote stream **DONE** (but **FIXME** on subsequent
  streams added)

Streams are removed from PC.remoteStreams **FIXME**

removestream event fired **FIXME**

Once a stream is being consumed from a remote source, if the remote
  source adds or removes a track then negotiationneeded should
  fire. **FIXME**


## 5.1

offer/answer types can be only "offer", "answer" and "pranswer" **TODO**
  for pranswer (other parts done)

Check the peer state attribute: (**FIXME**: does not exist)
- new
- have-local-offer
- have-local-pranswer
- have-remote-pranswer
- active
- closed


## 5.1.16

PC.createOffer does its thing **DONE**

PC.createAnswer does its thing **DONE**
- What happens when you call both? **TODO**
- What happens when you call them multiple times? **DONE**

PC.setLocalDescription does its thing
- PC.localDescription is updated (null to start) **FIXME**
- Invalid calls **TODO**
- Multiple calls **TODO**

PC.setRemoteDescription does its thing **DONE**
- PC.remoteDescription is updated **FIXME**
- Invalid calls **TODO**
- Multiple calls **TODO**
- Should fire onaddstream soon after calling (before full negotiation;
  check some state?)

updateIce and addIceCandidate does something? **DONE**
.iceGatheringState
  - "new", "gathering" or "complete" **FIXME**
  - calls ongatheringchange **FIXME**

.iceState **FIXME**
  - "starting", "checking", "connected", "completed", "failed",
    "disconnected", "closed" **FIXME** (no iceState)

localStreams and remoteStreams are updated **FIXME**
  these are live arrays N/A

.addStream **DONE**
  - .addStream with constraints? **TODO**

.removeStream **FIXME** (cannot detect if it works, onremovestream not
  called)

PC.createDataChannel perhaps? **TODO**

.getStats? **TODO**

.close() **FIXME**

.readyState **FIXME**
  - "new", "have-local-offer", "have-local-pranswer",
    "have-remote-pranswer", "active", "closed"


### Events

onnegotiationneeded **FIXME** (cannot set)

onicecandidate **FIXME** (does nothing)

onopen **FIXME** (cannot set)
- When is it called?

onstatechange **FIXME** (does nothing)

onaddstream **DONE**

onremovestream **FIXME** (does nothing)

ongatheringchange **FIXME** (does nothing)

onicechange **FIXME** (does nothing)

onidentityresult? **TODO**


### Methods

Not sure how to test addIceCandidate()


#### addStream()

if readyState == closed, then throw INVALID_STATE_ERR **FIXME**: cannot
  close

if stream already in localStreams, ignore **FIXME**: throws error

stream goes at end of localStreams **FIXME**: cannot tell

What to do with constraints? **TODO**

Fire negotiationneeded event (even if not yet connected?) **FIXME**

returns void **DONE**


#### removeStream()
like addStream() (closed, not found in localStreams) **FIXME**: cannot
  tell

remove from localStreams **FIXME**: cannot tell

fire negotiationneeded **FIXME**


#### close()
if already closed, then throw `INVALID_STATE_ERR` **FIXME**

get rid of ICE Agent (not sure how to detect?) **TODO**

readyState = closed **FIXME**: cannot tell

returns void **DONE**

#### createAnswer() and createOffer()

success callback required **DONE**

failure and constraints not **DONE**

constraints can throw an exception if malformed. **TODO**


# Questions

When does onended get fired? (4.2.1.2)

Is it okay if addtrack fires for a non-muted track? (4.2.2)

How does a local user agent disable a track? (4.2.2)

Is there anything in RTCPeerConnection(configuration) to be tested?
Specifically "configuration"? (5)

Not sure what values to expect for RTCPeerConnection.readyState (5) or
ice state

In [5.1.2.1 Attributes] why are type and sdp nullable?

In [5.1.7 RTCPeerState Enum] is peer state an attribute somewhere?
Maybe these are attributes on the RTCPeerConnection object?

Note sure what to do with onicecandidate, or onicechange (5.1)

"This event handler, of event handler event type removestream, must be
fired by all objects implementing the RTCPeerConnection interface. It
is called any time a MediaStream is removed by the remote peer. This
will be fired only as a result of setRemoteDescription." - that
doesn't seem right?

How are constraints (in createAnswer) formatted?
