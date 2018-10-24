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

  function init() {
      alert('hello');
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
    testWebSocket();
  }

  function getElement(id, sequence) {
      return document.getElementById(id + sequence);
  }

  function getIpAddress(sequence) {
      var el = getElement("ipAddr", sequence);
      return el.value;
  }

  function testWebSocket() {
    ipAddr1 = ipAddrField1.value;
    wsUri1 = "ws://" + ipAddr1 + ":8080/"
    websocket1 = new WebSocket(wsUri1, "gabbo");
    websocket1.onopen = function (evt) {
      onOpen(evt, "1")
    };
    websocket1.onclose = function (evt) {
      onClose(evt, "1")
    };
    websocket1.onmessage = function (evt) {
      onMessage(evt, "1")
    };
    websocket1.onerror = function (evt) {
      onError(evt, "1")
    };

    ipAddr2 = ipAddrField2.value;
    wsUri2 = "ws://" + ipAddr2 + ":8080/"
    websocket2 = new WebSocket(wsUri2, "gabbo");
    websocket2.onopen = function (evt) {
      onOpen(evt, "2")
    };
    websocket2.onclose = function (evt) {
      onClose(evt, "2")
    };
    websocket2.onmessage = function (evt) {
      onMessage(evt, "2")
    };
    websocket2.onerror = function (evt) {
      onError(evt, "2")
    };
  }

  function onOpen(evt, sequence) {
    writeToScreen("CONNECTED");
    //connectBtn.value = "Disconnect";
    var ipAddrField = getElement("ipAddr", sequence);
    $(ipAddrField).prop("disabled", "disabled");
    //$(ipAddrField2).prop("disabled", "disabled");
    //doSend("WebSocket rocks");
    writeToScreen("Getting info for " + sequence + "...");
    $.get("http://" + getIpAddress(sequence) + ":8090/info")
      .done(function (data) {
        infoReceived(data, sequence)
      })
      .fail(function () {
        alert("info for " + sequence+ " failed");
      });
  }

  function infoReceived(data, sequence) {
    var name = $(data).find("name").text();
    var type = $(data).find("type").text();
    var mac = $(data).find("info").attr("deviceID");

    //ctrl.value = "Name: " + name + ", MAC: " + mac + ", type: " + type;
    // TODO populate name and save MAC somewhere

  }

  function onClose(evt, sequence) {
    writeToScreen("DISCONNECTED");
    //connectBtn.value = "Connect";
    var ipAddrField = getElement("ipAddr", sequence);
    $(ipAddrField).removeAttr("disabled");
    //$(ipAddrField2).removeAttr("disabled");
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
      writeStatus("Master: " + masterIp + "(" + masterMac + "), slave: " + slaveIp + "(" + slaveMac + ")");
    }
  }

  /* NOTES ON HOW /SETZONE WORKS

  /setZone with master A will only be successful if sent to A's IP address
  if called on B's IP, it is ignored




  */




  function onSetZoneClick(sequence) {
    // <zone master="F45EAB6906CA"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>
    var ipAddr = getIpAddress(sequence);
    var postURL = "http://" + ipAddr + ":8090";
    var master = "";
    if(sequence === "1") {
        master = "F45EAB6906CA";
    } else {
        master = "A81B6A550F06";
    }


    var data =
      '<zone master="'+master+'"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>';

    $.ajax({
      url: postURL + "/setZone",
      type: 'POST',
      crossDomain: true,
      data: data,
      dataType: 'text',
      success: function (result) {
          document.getElementById("zoneStatus").value = result;
        //writeStatus(result);
      },
      error: function (jqXHR, transStatus, errorThrown) {
        alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
          'Response: ' + jqXHR.responseText);
      }
    });

  }

  function onSetZone2Click() {
    // <zone master="F45EAB6906CA"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>
    var postURL = "http://" + ipAddr2 + ":8090";
    var data =
      '<zone master="A81B6A550F06"><member ipaddress="192.168.1.111">F45EAB6906CA</member><member ipaddress="192.168.1.120">A81B6A550F06</member></zone>';

    $.ajax({
      url: postURL + "/setZone",
      type: 'POST',
      crossDomain: true,
      data: data,
      dataType: 'text',
      success: function (result) {
        writeStatus(result);
      },
      error: function (jqXHR, transStatus, errorThrown) {
        alert('Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '.' +
          'Response: ' + jqXHR.responseText);
      }
    });

  }

  function onPresetKeyClick() {
    var postURL = "http://" + ipAddr1 + ":8090";
    var data = "<key state='release' sender='Gabbo'>PRESET_1</key>";

    $.ajax({
      url: postURL + "/key",
      type: 'POST',
      crossDomain: true,
      data: data,
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

    if (xmlMessage.find('nowPlaying').attr('source') === 'STANDBY') {
      //outArea.value += "STANDBY\n";
      return;
    }

    //var track = xmlMessage.find("track").text(); // for some unknown reason there is another element in jquery object and this is empty
    var track = xmlMessage.find("track").text();
    if (track === "") {
      track = xmlMessage.find("track")[0].nextSibling.textContent
    }
    var album = xmlMessage.find("album").text();
    var artist = xmlMessage.find("artist").text();
    var time = xmlMessage.find("time");
    var total = time.attr("total");
    var current = time.text();
    var progress = Math.floor(current / total * 100);

    //outArea.value += artist + " - " + track + " (" + album + ") [" + current + "/" + total + " - " + progress + "]\n";

    getElement("song", sequence).value = track;
    getElement("album", sequence).value = album;
    getElement("artist", sequence).value = artist;
    
  }

  function onMessage(evt, sequence) // notification update from server/speaker
  {
    //writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
    processNotification(evt.data, sequence);
    //websocket.close();
  }

  function onError(evt, sequence) {
    writeToScreen('<span style="color: red;">ERROR ('+sequence+'):</span> ' + evt.data);
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
      // <updates deviceID="A81B6A550F06"><volumeUpdated><volume><targetvolume>0</targetvolume><actualvolume>0</actualvolume><muteenabled>false</muteenabled></volume></volumeUpdated></updates>
    } else if (childElementName === "ZONEUPDATED") {
      // <updates deviceID="A81B6A550F06"><zoneUpdated><zone /></zoneUpdated></updates>
    }




  }

  function writeXml(data) {
    rawArea.value += data + "\n\n";
  }

  function onConnectClick() {
    if (websocket1.readyState === 1) {
      websocket1.close();
      websocket2.close();
    } else {
      testWebSocket();
    }
  }



  window.addEventListener("load", init, false);