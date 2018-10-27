var soundTouchInfo = (function () {

    return {
        infoReceived: function (data, sequence) {
        var name = $(data).find("name").text();
        var type = $(data).find("type").text();
        var mac = $(data).find("info").attr("deviceID");

        var info = soundTouchCommon.speakers[sequence]
        info["name"] = name;
        info["type"] = type;
        info["mac"] = mac;

        $(soundTouchCommon.getElement("name", sequence)).text(name);

        soundTouchNowPlaying.queryNowPlaying(sequence);
        soundTouchVolume.queryVolume(sequence);
    }
};

})();