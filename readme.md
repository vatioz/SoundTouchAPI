#  BOSE SoundTouch API web page controller

Basically this is a single webpage allowing me to interact with my two BOSE SoundTouch 10 speakers. 

It more or less touches all the interesting parts of the SoundTouch API and the Notification API. 

UI is hard-coded for 2 speakers as I have exactly two speakers and I didn't want to force universality, as I don't need it yet. 

The only piece of information required from user is IP address of each speaker. I wanted to avoid the need of implementing Bonjour discovery in JS such simple project. This requires static IP for the speakers, but on the other hand avoids problems with discovery and avoids dependencies. And most importantly, it fits my needs :)

JavaScript is mostly universal and only relies on *sequence* number of the speaker (which is passed as parameter in button click calls and also coded into IDs of html elements). From the point of Javascript, it should be fairly easy to add another speaker.  
The only place it is not universal is Zones. This is on my list of TODOs.

There are few things that this page gives you, that official BOSE SoundTouch app doesn't.

 * Side-by-side view of both speakers
 * Indicator of WIFI signal strength
 * Auto-zoning - one button will create zone without asking who is master and who slave - simply the one playing is a master
 * Text log of all notifications speakers are sending