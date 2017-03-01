// generator-donejs build.js
var stealTools = require("steal-tools");

/* exported buildPromise */
var buildPromise = stealTools.build({
  config: __dirname + "/package.json!npm"
}, {
  bundleAssets: true
});
