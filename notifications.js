/*
TODO process other update messages NETWORK SIGNAL (show some icon of signal strength)
TODO slice this file into multiple files, each solving specific area - volume/nowPlaying/zones/keys/...
TODO timer to have nowplaying updated more frequently
TODO write something useful into zoneStatus 

*/


var wsUri1;
var wsUri2;
var ipAddr1;
var ipAddrField1;
var output;
var connectBtn;
var getZoneBtn;
var setZoneBtn;
var addZoneSlaveBtn;
var removeZoneSlaveBtn;
var nameField;
var outArea;
var rawArea;
var status1;
var status2;

var song1;
var album1;
var artist1;

var speakers = {}

function init() {
    output = document.getElementById("output");
    outArea = document.getElementById("outArea");
    rawArea = document.getElementById("rawArea");
    connectBtn = document.getElementById("connectBtn");
    getZoneBtn = document.getElementById("getZoneBtn");
    setZoneBtn = document.getElementById("setZoneBtn");
    addZoneSlaveBtn = document.getElementById("addZoneSlaveBtn");
    removeZoneSlaveBtn = document.getElementById("removeZoneSlaveBtn");
    nameField1 = document.getElementById("name1");
    nameField2 = document.getElementById("name2");
    ipAddrField1 = document.getElementById("ipAddr1");
    ipAddrField2 = document.getElementById("ipAddr2");
    status1 = document.getElementById("status1");
    status2 = document.getElementById("status2");
    song1 = document.getElementById("song1");
    album1 = document.getElementById("album1");
    artist1 = document.getElementById("artist1");

    start("1");
    start("2");
}

function getElement(id, sequence) {
    return document.getElementById(id + sequence);
}

function getIpAddress(sequence) {
    var el = getElement("ipAddr", sequence);
    return el.value;
}

function start(sequence) {
    var ip = getIpAddress(sequence);
    var wsUri = "ws://" + ip + ":8080/";
    var websocket = new WebSocket(wsUri, "gabbo");

    var info = {};
    info["ip"] = ip;
    info["socket"] = websocket;
    speakers[sequence] = info;


    websocket.onopen = function (evt) {
        onOpen(evt, sequence);
    };
    websocket.onclose = function (evt) {
        onClose(evt, sequence);
    };
    websocket.onmessage = function (evt) {
        onMessage(evt, sequence);
    };
    websocket.onerror = function (evt) {
        onError(evt, sequence);
    };
}

function onOpen(evt, sequence) {
    writeToScreen("CONNECTED (" + sequence + ")");
    var connectBtn = getElement("connectText", sequence);
    $(connectBtn).text("Unsubscribe");


    var ipAddrField = getElement("ipAddr", sequence);
    $(ipAddrField).prop("disabled", "disabled");

    var info = speakers[sequence];
    info["ip"] = getIpAddress(sequence);
    speakers[sequence] = info;

    writeToScreen("Getting info for " + sequence + "...");

    $.get("http://" + speakers[sequence]["ip"] + ":8090/info")
        .done(function (data) {
            infoReceived(data, sequence)
        })
        .fail(function () {
            alert("info for " + sequence + " failed");
        });
}

function infoReceived(data, sequence) {
    var name = $(data).find("name").text();
    var type = $(data).find("type").text();
    var mac = $(data).find("info").attr("deviceID");

    var info = speakers[sequence]
    info["name"] = name;
    info["type"] = type;
    info["mac"] = mac;

    $(getElement("name", sequence)).text(name);

    onNowPlayingClick(sequence);
    queryVolume(sequence);
}

function onClose(evt, sequence) {
    writeToScreen("DISCONNECTED (" + sequence + ")");

    var connectBtn = getElement("connectText", sequence);
    $(connectBtn).text("Subscribe");

    var ipAddrField = getElement("ipAddr", sequence);
    $(ipAddrField).removeAttr("disabled");

    getElement("song", sequence).value = "";
    getElement("album", sequence).value = "";
    getElement("artist", sequence).value = "";
    getElement("name", sequence).value = "";
}

function onGetZoneClick(evt) {
    writeToScreen("Getting zone info...");
    $.get("http://" + ipAddr1 + ":8090/getZone")
        .done(function (data) {
            zoneReceived(data);
        })
        .fail(function () {
            alert("get zone failed");
        });

    // no zone = <zone />
    // <zone master="F45EAB6906CA"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>
}

function zoneReceived(data) {
    var masterMac;
    var masterIp;
    var slaveMac;
    var slaveIp;
    var zone = $(data).find("zone");
    if (zone[0].attributes.length === 0) {
        writeStatus('No zone')
    } else {
        masterMac = zone.attr('master');
        var members = {}
        zone.children().each(function () {
            var member = $(this);
            var ip = member.attr('ipaddress');
            var mac = member.text();
            if (mac === masterMac) {
                masterIp = ip;
            } else {
                slaveIp = ip;
                slaveMac = mac;
            }
        });

        writeZoneStatus("Master: " + masterIp + "(" + masterMac + "), slave: " + slaveIp + "(" + slaveMac + ")");

    }
}

/* NOTES ON HOW /SETZONE WORKS

/setZone with master A will only be successful if sent to A's IP address
if called on B's IP, it is ignored




*/




function onSetZoneClick(sequence, include1, include2) {
    // <zone master="F45EAB6906CA"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>
    var ipAddr = getIpAddress(sequence);
    var postURL = "http://" + ipAddr + ":8090";
    var master = "";
    if (sequence === "1") {
        master = "F45EAB6906CA";
    } else {
        master = "A81B6A550F06";
    }

    var member1 = '<member ipaddress="192.168.1.111">F45EAB6906CA</member>';
    var member2 = '<member ipaddress="192.168.1.121">A81B6A550F06</member>';

    var data = '<zone master="' + master + '">';

    if (include1) {
        data += member1;
    }
    if (include2) {
        data += member2;
    }

    data += '</zone>';

    $.ajax({
        url: postURL + "/setZone",
        type: 'POST',
        crossDomain: true,
        data: data,
        dataType: 'text',
        success: function (result) {
            // nothing interesting in success data
        },
        error: function (jqXHR, transStatus, errorThrown) {
            alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
                'Response: ' + jqXHR.responseText);
        }
    });

}

function onRemoveSlaveClick(toRemove) {
    if (toRemove === "1") {
        onSetZoneClick("2", false, true);
    } else if (toRemove === "2") {
        onSetZoneClick("1", true, false);
    }
}


function onAutoZoneClick() {
    for (var i = 1; i <= speakers.length; i++) {
        var info = speakers[i];
        if (info.status === "PLAY_STATE") {
            onSetZoneClick(i, true, true);
            return;
        }
    }

    onSetZoneClick("1", true, true);
    //writeZoneStatus("No speaker seems to be playing. Can't form a group.");
}

function writeZoneStatus(msg) {
    document.getElementById("zoneStatus").value = msg;
}

function onKeyClick(key, sequence) {
    var ip = speakers[sequence]["ip"]
    var postURL = "http://" + ip + ":8090";
    var dataPress = "<key state='press' sender='Gabbo'>" + key + "</key>";
    var dataRelease = "<key state='release' sender='Gabbo'>" + key + "</key>";

    $.ajax({
        url: postURL + "/key",
        type: 'POST',
        crossDomain: true,
        data: dataPress,
        dataType: 'text',
        success: function (result) {
            //Worked.
        },
        error: function (jqXHR, transStatus, errorThrown) {
            alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
                'Response: ' + jqXHR.responseText);
        }
    });

    $.ajax({
        url: postURL + "/key",
        type: 'POST',
        crossDomain: true,
        data: dataRelease,
        dataType: 'text',
        success: function (result) {
            //Worked.
        },
        error: function (jqXHR, transStatus, errorThrown) {
            alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
                'Response: ' + jqXHR.responseText);
        }
    });
}


function onNowPlayingClick(sequence) {

    //<nowPlaying deviceID="F45EAB6906CA" source="SPOTIFY" sourceAccount="upirka"><ContentItem source="SPOTIFY" type="uri" location="spotify:user:upirka:collection" sourceAccount="upirka" isPresetable="true"><itemName>My songs</itemName><containerArt>https://i.scdn.co/image/45516b74fa36780c09297b04a68d765fa35a91c3</containerArt></ContentItem><track>Hoist That Rag</track><artist>Tom Waits</artist><album>Real Gone</album><stationName /><art artImageStatus="IMAGE_PRESENT">http://i.scdn.co/image/1fb36589567846a7ea4797319d940aff1e4e64f2</art><time total="248">91</time><skipEnabled /><favoriteEnabled /><playStatus>PLAY_STATE</playStatus><shuffleSetting>SHUFFLE_OFF</shuffleSetting><repeatSetting>REPEAT_OFF</repeatSetting><skipPreviousEnabled /><streamType>TRACK_ONDEMAND</streamType><trackID>spotify:track:4H3K3jbAgNoDIbVcU6c6kg</trackID></nowPlaying>

    $.get("http://" + getIpAddress(sequence) + ":8090/now_playing")
        .done(function (data) {
            nowPlayingReceived($(data), sequence);
        })
        .fail(function () {
            alert("now_playing failed");
        });
}

function nowPlayingReceived(xmlMessage, sequence) {

    var nowPlaying = xmlMessage.find('nowPlaying');
    if (nowPlaying.attr('source') === 'STANDBY') {
        //outArea.value += "STANDBY\n";
        return;
    }

    //var track = nowPlaying.find("track").text(); // for some unknown reason there is another element in jquery object and this is empty
    var trackEl = nowPlaying.find("track");
    if (trackEl.length > 0) {
        
        var track = trackEl.text();
        if (track === "") {
            track = trackEl[0].nextSibling.textContent
        }
        var album = nowPlaying.find("album").text();
        var artist = nowPlaying.find("artist").text();
        getElement("song", sequence).value = track;
        getElement("album", sequence).value = album;
        getElement("artist", sequence).value = artist;


        var time = nowPlaying.find("time");
        var total = time.attr("total");
        var current = time.text();
        var progress = Math.floor(current / total * 100);
        setProgress(progress, sequence);

        var currentTime = getTimeFromSeconds(current);
        var totalTime = getTimeFromSeconds(total);
        setTime(currentTime, totalTime, sequence);
    }
    var playStatus = nowPlaying.find("playStatus").text();
    setPlayStatus(playStatus, sequence);    
}

function setPlayStatus(playStatus, sequence) {
    speakers[sequence]["playStatus"] = playStatus;
    var playBtn = getElement("playBtn", sequence);
    playBtn = $(playBtn);

    if(playStatus === "PLAY_STATE") {
        playBtn.html("<i class='fas fa-pause'></i>");    
    } else {
        playBtn.html("<i class='fas fa-play'></i>");
    }    
}

function setProgress(progressVal, sequence) {
    var progressEl = getElement("progress", sequence);
    progressEl = $(progressEl);
    progressEl.css("width", progressVal + "%");
    progressEl.text(progressVal + " %");
}

function getTimeFromSeconds(justSeconds) {
    var minutes = Math.floor(justSeconds / 60);
    var seconds = justSeconds % 60;

    return str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
}

function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}

function setTime(current, total, sequence) {
    var currentEl = getElement("currentTime", sequence);
    currentEl = $(currentEl);
    currentEl.text(current);

    var totalEl = getElement("totalTime", sequence);
    totalEl = $(totalEl);
    totalEl.text(total);
}

function onMessage(evt, sequence) // notification update from server/speaker
{
    //writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
    processNotification(evt.data, sequence);
    //websocket.close();
}

function onError(evt, sequence) {
    writeToScreen('<span style="color: red;">ERROR (' + sequence + '):</span> ' + evt.data);
    writeXml(evt.data);
}

// function doSend(message)
// {
//   writeToScreen("SENT: " + message);
//   websocket.send(message);
// }

function writeToScreen(message) {
    var pre = document.createElement("pre");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

function writeStatus(msg) {
    status1.value = msg;
}

function processNotification(message, sequence) {
    writeXml(message);

    var xmlMessage = $(message);
    var topElementName = xmlMessage[0].tagName;
    var childElementName = "";
    if (xmlMessage.children().length > 0) {
        childElementName = xmlMessage.children()[0].tagName;
    }
    if (topElementName.toLocaleUpperCase() === "SOUNDTOUCHSDKINFO") {


    } else if (childElementName === "NOWPLAYINGUPDATED") {
        nowPlayingReceived(xmlMessage.find('nowPlayingUpdated'), sequence);
        // also this may come
        // <updates deviceid="F45EAB6906CA"><nowplayingupdated><nowplaying deviceid="F45EAB6906CA" source="STANDBY"><contentitem source="STANDBY" ispresetable="true"></contentitem></nowplaying></nowplayingupdated></updates>
        // <updates deviceID="F45EAB6906CA"><nowPlayingUpdated><nowPlaying deviceID="A81B6A550F06" source="SPOTIFY" sourceAccount="upirka"><ContentItem source="SPOTIFY" type="DO_NOT_RESUME" location="Unplayable location string" sourceAccount="upirka" isPresetable="false" /><track /><artist /><album /><stationName /><art artImageStatus="SHOW_DEFAULT_IMAGE" /><playStatus>PAUSE_STATE</playStatus></nowPlaying></nowPlayingUpdated></updates>

    } else if (childElementName === "CONNECTIONSTATEUPDATED") {
        // <updates deviceID="F45EAB6906CA"><connectionStateUpdated state="NETWORK_WIFI_CONNECTED" up="true" signal="EXCELLENT_SIGNAL" /></updates>
        // <updates deviceID="A81B6A550F06"><connectionStateUpdated state="NETWORK_WIFI_CONNECTED" up="true" signal="GOOD_SIGNAL" /></updates>
    } else if (childElementName === "USERACTIVITYUPDATE") {
        // <userActivityUpdate deviceID="F45EAB6906CA" />
    } else if (childElementName === "VOLUMEUPDATED") {
        volumeReceived(xmlMessage.find('volumeUpdated'), sequence);
        // <updates deviceID="A81B6A550F06"><volumeUpdated><volume><targetvolume>0</targetvolume><actualvolume>0</actualvolume><muteenabled>false</muteenabled></volume></volumeUpdated></updates>
    } else if (childElementName === "ZONEUPDATED") {
        // <updates deviceID="A81B6A550F06"><zoneUpdated><zone /></zoneUpdated></updates>
    }
}

function queryVolume(sequence) {
    $.get("http://" + getIpAddress(sequence) + ":8090/volume")
        .done(function (data) {
            volumeReceived($(data), sequence);
        })
        .fail(function () {
            alert("volume " + sequence + " failed");
        });
}

function volumeReceived(xmlMessage, sequence) {
    var volumeNode = xmlMessage.find("actualvolume");
    var volumeVal = volumeNode.text();
    setVolumeVal(volumeVal, sequence);
    setVolumeProgress(volumeVal, sequence);
}

function setVolumeVal(volumeVal, sequence) {
    var volumeTextEl = getElement("currentVolume", sequence);
    volumeTextEl = $(volumeTextEl);
    volumeTextEl.text(volumeVal);
}

function setVolumeProgress(volumeVal, sequence) {
    var volumeProgressEl = getElement("volume", sequence);
    volumeProgressEl = $(volumeProgressEl);
    volumeProgressEl.val(volumeVal);
}

function onVolumeMouseUp(sequence) {
    var volumeProgressEl = getElement("volume", sequence);
    var volumeVal = volumeProgressEl.value;

    var ip = speakers[sequence]["ip"]
    var postURL = "http://" + ip + ":8090";
    var dataVolume = "<volume sender='Gabbo'>" + volumeVal + "</volume>";

    $.ajax({
        url: postURL + "/volume",
        type: 'POST',
        crossDomain: true,
        data: dataVolume,
        dataType: 'text',
        success: function (result) {
            //Worked.
        },
        error: function (jqXHR, transStatus, errorThrown) {
            alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
                'Response: ' + jqXHR.responseText);
        }
    });
}

function writeXml(data) {
    rawArea.value += data + "\n\n";
}

function onConnectClick(sequence) {
    var socket = speakers[sequence]["socket"];
    if (socket.readyState === 1) {
        socket.close();
    } else {
        start(sequence);
    }
}



window.addEventListener("load", init, false);