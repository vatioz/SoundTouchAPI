var soundTouchCommon = (function () {

    var logArea;

    return {

        speakers: {

        },

        init: function() {
            logArea = document.getElementById("rawArea");
        },



        getTimeFromSeconds: function (justSeconds) {
            var minutes = Math.floor(justSeconds / 60);
            var seconds = justSeconds % 60;
            return soundTouchCommon.str_pad_left(minutes, '0', 2) + ':' + soundTouchCommon.str_pad_left(seconds, '0', 2);
        },

        str_pad_left: function (string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        },

        writeLog: function (data) {
            currentContent = logArea.value;
            logArea.value = new Date().toLocaleString() +": " + data + "\n\n" + currentContent;
        },

        getElement: function (id, sequence) {
            return document.getElementById(id + sequence);
        },
        
        getIpAddress: function (sequence) {
            var el = soundTouchCommon.getElement("ipAddr", sequence);
            return el.value;
        }
    };
})();