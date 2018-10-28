var soundTouchStarter = (function () {

    function onLoaded() {
        soundTouchCommon.init();
        start("1");
        start("2");
    }

    function start(sequence) {
        var ip = soundTouchCommon.getIpAddress(sequence);
        var wsUri = "ws://" + ip + ":8080/";
        var websocket = new WebSocket(wsUri, "gabbo");

        var info = {};
        info["ip"] = ip;
        info["socket"] = websocket;
        soundTouchCommon.speakers[sequence] = info;

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
        soundTouchCommon.writeLog("CONNECTED (" + sequence + ")");
        //var connectBtn = soundTouchCommon.getElement("connectText", sequence);
        //$(connectBtn).text("Unsubscribe");


        var connectBtn = soundTouchCommon.getElement("connectBtn", sequence);
        $(connectBtn).removeClass("btn-dark");
        $(connectBtn).addClass("btn-success");
        var nowPlayingRow = document.getElementById('nowPlayingRow');
        $(nowPlayingRow).collapse('show');

        var ipAddrField = soundTouchCommon.getElement("ipAddr", sequence);
        $(ipAddrField).prop("disabled", "disabled");

        var info = soundTouchCommon.speakers[sequence];
        info["ip"] = soundTouchCommon.getIpAddress(sequence);
        soundTouchCommon.speakers[sequence] = info;

        soundTouchCommon.writeLog("Getting info for " + sequence + "...");

        $.get("http://" + soundTouchCommon.speakers[sequence]["ip"] + ":8090/info")
            .done(function (data) {
                soundTouchInfo.infoReceived(data, sequence)
            })
            .fail(function () {
                alert("info for " + sequence + " failed");
            });
    }

    function onClose(evt, sequence) {
        soundTouchCommon.writeLog("DISCONNECTED (" + sequence + ")");

        var connectBtn = soundTouchCommon.getElement("connectBtn", sequence);
        $(connectBtn).removeClass("btn-success");
        $(connectBtn).addClass("btn-dark");
        
        var nowPlayingRow = document.getElementById('nowPlayingRow');
        $(nowPlayingRow).collapse('hide');
        
        var ipAddrField = soundTouchCommon.getElement("ipAddr", sequence);
        $(ipAddrField).removeAttr("disabled");

        soundTouchCommon.getElement("song", sequence).value = "";
        soundTouchCommon.getElement("album", sequence).value = "";
        soundTouchCommon.getElement("artist", sequence).value = "";
        soundTouchCommon.getElement("name", sequence).value = "";
    }

    function onMessage(evt, sequence) { // notification update from server/speaker
        soundTouchNotifications.onNotification(evt.data, sequence);
    }

    function onError(evt, sequence) {
        soundTouchCommon.writeLog("ERROR: " + evt.data);
    }

    return {
        init: function () {
            window.addEventListener("load", onLoaded, false);
        },

        onConnectClick: function (sequence) {
            var socket = soundTouchCommon.speakers[sequence]["socket"];
            if (socket.readyState === 1) {
                socket.close();
            } else {
                start(sequence);
            }
        },
    };
})();