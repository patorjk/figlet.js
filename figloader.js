/*
    By Patrick Gillespie (patorjk@gmail.com)
    License: MIT
*/

var FigletLoader = FigletLoader || (function() {
    var me = {};
    me.load = function(figlet, fontUrl, callback) {
        $.ajax({
            url: fontUrl,
            success: function(data) {
                if (callback) {
                    callback(data);
                }
            }
        });
    }
    return me;
})();