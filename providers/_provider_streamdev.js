http = require('http');

module.exports = StreamdevProvider;

var IptvProvider = require('./iptv_provider');

util.inherits(StreamdevProvider, IptvProvider.Http);

function StreamdevProvider(server_url, opts) {
        StreamdevProvider.super_.call(this, opts);

        this._streamdev_url = server_url;
}

StreamdevProvider.prototype._get_url = function(cb) {
        var channel = this._channel;
        var base_url = this._streamdev_url;

        var req = http.request(this._streamdev_url + "/channels.m3u", function(res) {
                var pl = "";

                res.on('data', function(chunk) {
                        pl += chunk;
                });

                res.on('end', function() {
                        var match_m3u = new RegExp("EXTINF:-1,\\d* (.*)\r\n.*[/]([\\w-]*)");
                        var res = pl.split('#').reduce(function (prev, el) {
                                if (prev)
                                        return prev;

                                var found = el.match(match_m3u);

                                if (found && found.length > 1 && found[1] == channel)
                                        prev = base_url + "/" + found[2] + ".ts";
                                return prev;
                        }, undefined);

                        if (res) {
                                cb(null, { url: res });
                        } else {
                                console.log("Streamdev channel " + channel + " not found");
                                cb("Streamdev channel " + channel + " not found");
                        }
                });
        });

        req.on('error', function(e) {
                cb("GetStreamdev playlist failed");
        });

        req.end();
};

StreamdevProvider.prototype._release = function() {
        return;
};
