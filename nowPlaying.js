var soundTouchNowPlaying = (function () {

    function setPlayStatus(playStatus, sequence) {
        soundTouchCommon.speakers[sequence]["playStatus"] = playStatus;
        var playBtn = soundTouchCommon.getElement("playBtn", sequence);
        playBtn = $(playBtn);

        if (playStatus === "PLAY_STATE") {
            playBtn.html("<i class='fas fa-pause'></i>");
        } else {
            playBtn.html("<i class='fas fa-play'></i>");
        }
    }

    function setProgress(progressVal, sequence) {
        var progressEl = soundTouchCommon.getElement("progress", sequence);
        progressEl = $(progressEl);
        progressEl.css("width", progressVal + "%");
        progressEl.text(progressVal + " %");
    }

    function setTime(current, total, sequence) {
        var currentEl = soundTouchCommon.getElement("currentTime", sequence);
        currentEl = $(currentEl);
        currentEl.text(current);

        var totalEl = soundTouchCommon.getElement("totalTime", sequence);
        totalEl = $(totalEl);
        totalEl.text(total);
    }

    return {
        queryNowPlaying: function(sequence){
            $.get("http://" + soundTouchCommon.getIpAddress(sequence) + ":8090/now_playing")
            .done(function (data) {
                soundTouchNowPlaying.nowPlayingReceived($(data), sequence);
            })
            .fail(function () {
                alert("now_playing failed");
            });
        },

        onNowPlayingClick: function (sequence) {
            this.queryNowPlaying(sequence);
        },

        nowPlayingReceived: function (xmlMessage, sequence) {
            var nowPlaying = xmlMessage.find('nowPlaying');
            if (nowPlaying.attr('source') === 'STANDBY') {
                return;
            }
    
            // for some unknown reason there is another element in jquery object and this is empty
            var trackEl = nowPlaying.find("track");
            if (trackEl.length > 0) {
    
                var track = trackEl.text();
                if (track === "") {
                    track = trackEl[0].nextSibling.textContent
                }
                var album = nowPlaying.find("album").text();
                var artist = nowPlaying.find("artist").text();
                soundTouchCommon.getElement("song", sequence).value = track;
                soundTouchCommon.getElement("album", sequence).value = album;
                soundTouchCommon.getElement("artist", sequence).value = artist;
    
    
                var time = nowPlaying.find("time");
                var total = time.attr("total");
                var current = time.text();
                var progress = Math.floor(current / total * 100);
                setProgress(progress, sequence);
    
                var currentTime = soundTouchCommon.getTimeFromSeconds(current);
                var totalTime = soundTouchCommon.getTimeFromSeconds(total);
                setTime(currentTime, totalTime, sequence);
            }
            var playStatus = nowPlaying.find("playStatus").text();
            setPlayStatus(playStatus, sequence);
        }
    };
})();