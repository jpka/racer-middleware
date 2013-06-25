var express = require("express"),
fs = require("fs"),
app = express();

app.use(express.cookieParser());

/* Dummy cookie auth */
app.get("/login", function(req, res) {
  res.cookie("loggedIn", "true");
  res.redirect("/");
});
app.get("/logout", function(req, res) { 
  res.cookie("loggedIn", "false");
  res.redirect("/");
});
app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    return req.cookies.loggedIn === "true";
  }
  next();
});

app.use("/racer", require("../")({
  db: require("livedb-mongo")("localhost:27017/test?auto_reconnect", {safe: true}),
  routes: {
    "count": function(req, model, done) {
      model.set("_page.authenticated", req.isAuthenticated());
      model.subscribe("collection", function() {
        done();
      });
    }
   },
  validation: function(shareRequest, cb) {
    cb(shareRequest.agent.req.isAuthenticated());
  }
}));

app.get("/require.js", function(req, res) {
  res.setHeader("Content-Type", "text/javascript");
  res.end(fs.readFileSync("node_modules/requirejs/require.js", "utf8"));
});

app.get("/", function(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.end(fs.readFileSync(__dirname + "/index.html", "utf8"));
});

app.listen(3000);
