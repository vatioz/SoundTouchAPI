var soundTouchConnectionState = (function () {

    return {

        connectionStateReceived: function (xmlMessage, sequence) {
            var state = xmlMessage.attr('state');
            var up = xmlMessage.attr('up');
            var signal = xmlMessage.attr('signal');

            if (state !== "NETWORK_WIFI_CONNECTED") { // not expected
                soundTouchCommon.writeLog("UNEXPECTED connection state: " + state);
            }

            if (up !== "true") { // not expected
                soundTouchCommon.writeLog("UNEXPECTED connection up: " + up);
            }

            if (signal !== "EXCELLENT_SIGNAL" && signal !== "GOOD_SIGNAL" && signal !== "MARGINAL_SIGNAL" && signal !== "POOR_SIGNAL") { // not expected
                soundTouchCommon.writeLog("UNEXPECTED connection signal: " + signal);
            }

            //setSignal(signal, sequence);
        },
    }
})();