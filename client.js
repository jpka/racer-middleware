var racer = require("racer");
require("racer-browserchannel/lib/browser");

racer.load = function(url, cb) {
  var xhr = new XMLHttpRequest();
  racer._model = null;

  xhr.onload = function() {
    racer.ready(cb);
    racer.init(JSON.parse(this.responseText));
  };
  xhr.open("get", url, true);
  xhr.send();
};

module.exports = racer;