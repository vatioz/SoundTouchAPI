/*
TODO test on phone
TODO timer to have nowplaying updated more frequently
TODO make 'Remove slave from zone' work
TODO write something useful into zoneStatus 
TODO make zones module more universal and easily extensible with more speakers
*/

var soundTouchNotifications = (function () {

    

    return {

        onNotification: function (message, sequence) {
            soundTouchCommon.writeLog(message);

            var xmlMessage = $(message);
            var topElementName = xmlMessage[0].tagName;
            var childElementName = "";
            if (xmlMessage.children().length > 0) {
                childElementName = xmlMessage.children()[0].tagName;
            }
            if (topElementName.toLocaleUpperCase() === "SOUNDTOUCHSDKINFO") {


            } else if (childElementName === "NOWPLAYINGUPDATED") {
                soundTouchNowPlaying.nowPlayingReceived(xmlMessage.find('nowPlayingUpdated'), sequence);
                // also this may come
                // <updates deviceid="F45EAB6906CA"><nowplayingupdated><nowplaying deviceid="F45EAB6906CA" source="STANDBY"><contentitem source="STANDBY" ispresetable="true"></contentitem></nowplaying></nowplayingupdated></updates>
                // <updates deviceID="F45EAB6906CA"><nowPlayingUpdated><nowPlaying deviceID="A81B6A550F06" source="SPOTIFY" sourceAccount="upirka"><ContentItem source="SPOTIFY" type="DO_NOT_RESUME" location="Unplayable location string" sourceAccount="upirka" isPresetable="false" /><track /><artist /><album /><stationName /><art artImageStatus="SHOW_DEFAULT_IMAGE" /><playStatus>PAUSE_STATE</playStatus></nowPlaying></nowPlayingUpdated></updates>

            } else if (childElementName === "CONNECTIONSTATEUPDATED") {
                // <updates deviceID="F45EAB6906CA"><connectionStateUpdated state="NETWORK_WIFI_CONNECTED" up="true" signal="EXCELLENT_SIGNAL" /></updates>
                // <updates deviceID="A81B6A550F06"><connectionStateUpdated state="NETWORK_WIFI_CONNECTED" up="true" signal="GOOD_SIGNAL" /></updates>
                soundTouchConnectionState.connectionStateReceived(xmlMessage.find('connectionStateUpdated'), sequence);
            } else if (childElementName === "USERACTIVITYUPDATE") {
                // <userActivityUpdate deviceID="F45EAB6906CA" />
            } else if (childElementName === "VOLUMEUPDATED") {
                soundTouchVolume.volumeReceived(xmlMessage.find('volumeUpdated'), sequence);
                // <updates deviceID="A81B6A550F06"><volumeUpdated><volume><targetvolume>0</targetvolume><actualvolume>0</actualvolume><muteenabled>false</muteenabled></volume></volumeUpdated></updates>
            } else if (childElementName === "ZONEUPDATED") {
                // <updates deviceID="A81B6A550F06"><zoneUpdated><zone /></zoneUpdated></updates>
                // soundTouchZones.zoneUpdated(...);
            }
        },        
    };
})();