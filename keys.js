var soundTouchKeys = (function () {

    return {
        onKeyClick: function (key, sequence) {
            var ip = soundTouchCommon.speakers[sequence]["ip"]
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
    }
})();