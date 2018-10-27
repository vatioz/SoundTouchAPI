var soundTouchVolume = (function () {
    
    function setVolumeVal(volumeVal, sequence) {
        var volumeTextEl = soundTouchCommon.getElement("currentVolume", sequence);
        volumeTextEl = $(volumeTextEl);
        volumeTextEl.text(volumeVal);
    }
    
    function setVolumeProgress(volumeVal, sequence) {
        var volumeProgressEl = soundTouchCommon.getElement("volume", sequence);
        volumeProgressEl = $(volumeProgressEl);
        volumeProgressEl.val(volumeVal);
    }   

    return {
        volumeReceived: function(xmlMessage, sequence) {
            var volumeNode = xmlMessage.find("actualvolume");
            var volumeVal = volumeNode.text();
            setVolumeVal(volumeVal, sequence);
            setVolumeProgress(volumeVal, sequence);
        },

        queryVolume: function(sequence) {
            $.get("http://" + soundTouchCommon.getIpAddress(sequence) + ":8090/volume")
                .done(function (data) {
                    soundTouchVolume.volumeReceived($(data), sequence);
                })
                .fail(function () {
                    alert("volume " + sequence + " failed");
                });
        },
        
        onVolumeMouseUp: function (sequence) {
            var volumeProgressEl = soundTouchCommon.getElement("volume", sequence);
            var volumeVal = volumeProgressEl.value;
        
            var ip = soundTouchCommon.speakers[sequence]["ip"]
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
    };
})();