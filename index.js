var path = require("path");

module.exports = function(opts) {
  var store = require("racer").createStore({
    db: opts.db
  }),
  b = require("racer/node_modules/browserify")(path.join(__dirname, "client.js")),
  modelMiddleware = store.modelMiddleware(store),
  racerBrowserChannel = require("racer-browserchannel")(store),
  storeBundle;

  b.require(path.join(__dirname, "node_modules", "node-uuid")); //We need to replace racer's uuid because the version that it uses breaks when required via AMD.
  b.bundle({standalone: "racer"}, function(err, bundle) {
    if (err) throw err;
    storeBundle = bundle;
  });

  if (opts.validation) {
    store.shareClient.use("connect", function(shareRequest, next) {
      shareRequest.agent.req = shareRequest.req;
      next();
    });
    store.shareClient.use("validate", function(shareRequest, next) {
      opts.validation(shareRequest, function(authorized) {
        next(authorized ? null : "unauthorized");
      });
    });
  }

  return function(req, res, next) {
    var path = this.route;

    if (req.url === "/") {
      res.setHeader("Content-Type", "text/javascript");
      return res.end(storeBundle);
    } else if (req.url === "/channel"){
      return racerBrowserChannel(req, res, next);
    }

    modelMiddleware(req, res, function() {
      racerBrowserChannel(req, res, function() {
        var model = req.getModel(),
        route = opts.routes && opts.routes[req.url.substr(1)],
        done = function() {
          model.bundle(function(err, modelBundle) {
            modelBundle.racerBrowserChannel.base = path + "/channel";
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(modelBundle));
          });
        };

        if (route) {
          route(req, model, done);
        } else {
          done();
        }
      });
    });
  };
};

