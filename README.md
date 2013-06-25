Express/Connect middleware that delivers [Racer](http://github.com/codeparty/racer.git) realtime model synchronization engine with routes and validation support.

For instance, you could do

Server:

```javascript
app.use("/racer", require("racer-middleware")({
  db: require("livedb-mongo")("localhost:27017/test?auto_reconnect", {safe: true}),
  routes: {
    "library": function(req, model, done) {
      model.set("_page.authenticated", req.isAuthenticated());
      model.subscribe("library", function() {
        done();
      });
    }
  },
  validation: function(shareRequest, cb) {
    cb(shareRequest.agent.req.isAuthenticated());
  }
}));
```

Client (with RequireJS):

```javascript
require(["/racer"], function(racer) {
  racer.load("/racer/library", function(model) {
    var authenticated = model.get("_page.authenticated"),
    books = model.get("library.books");

    /* etc */
  });
});
```

See example/ for a more complete example.

Notes:
- You need redis-server >= 2.6 and node >= 0.10 running on your machine for racer to work.
- Make sure the mongo url in the example is pointing to a running mongo server before running the example.