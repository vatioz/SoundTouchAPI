var soundTouchConnectionState = (function () {

    function setSignal(signal, sequence) {
        var signalEl = soundTouchCommon.getElement("signal", sequence);
        signalEl = $(signalEl);
        clearColors(signalEl);

        if(signal === "EXCELLENT_SIGNAL") {
            signalEl.addClass('text-success');
        } else if(signal === "GOOD_SIGNAL") {
            signalEl.addClass('text-info');
        } else if(signal === "MARGINAL_SIGNAL") {
            signalEl.addClass('text-warning');
        } else if(signal === "POOR_SIGNAL") {
            signalEl.addClass('text-danger');
        }
    }

    function clearColors(signalEl) {
        signalEl.removeClass('text-success');
        signalEl.removeClass('text-info');
        signalEl.removeClass('text-warning');
        signalEl.removeClass('text-danger');
    }


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

            setSignal(signal, sequence);
        },
    }
})();