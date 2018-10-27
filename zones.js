var soundTouchZones = (function () {

    function onGetZoneClick(evt) {
        soundTouchCommon.writeLog("Getting zone info...");
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
            writeZoneStatus('No zone')
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
        var ipAddr = soundTouchCommon.getIpAddress(sequence);
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
            var info = soundTouchCommon.speakers[i];
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
})();