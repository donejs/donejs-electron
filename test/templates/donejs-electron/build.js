// generator-donejs + donejs-electron build.js
var stealTools = require("steal-tools");

var buildPromise = stealTools.build({
  config: __dirname + "/package.json!npm"
}, {
  bundleAssets: true
});

// options added by `donejs add electron` - START
// previous electron options - START
var electronOptions = {
  buildDir: "./build",
  platforms: ["a"],
  archs: ["b"],
  glob: [
    "package.json",
    "production.html",
    "node_modules/steal/steal.production.js"
  ]
};

var stealElectron = require("steal-electron");

// Check if the electron option is passed.
var buildElectron = process.argv.indexOf("electron") > 0;

if(buildElectron) {
  buildPromise = buildPromise.then(function(buildResult){
    stealElectron(electronOptions, buildResult);
  });
}
// previous electron options - END
// options added by `donejs add electron` - END
