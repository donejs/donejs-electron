var Generator = require('yeoman-generator');
var os = require('os');
var Q = require('q');
var fs = require('fs');
var ejs = require('ejs');

var platform = {
  macos: os.platform() === 'darwin',
  linux: os.platform() === 'linux',
  windows: os.platform() === 'win32'
};

// convert friendly platform names to names supported
// by steal-electron (linux, win32, darwin, mas, all)
var getSupportedPlatform = function(platform) {
  var platformMap = {
    MacOS: 'darwin',
    Windows: 'win32',
    Linux: 'linux'
  };

  return platformMap[platform];
};

// convert friendly arch names to names supported
// by steal-electron (ia32, x64, armv7l, all)
var getSupportedArch = function(platform) {
  var archMap = {
    '32-bit (x86)': 'ia32',
    '64-bit (x64)': 'x64'
  };

  return archMap[platform];
};

var osArch = os.arch();
var arch = {
  '32': osArch === 'ia32' || osArch === 'x32' || osArch === 'x86',
  '64': osArch === 'x64'
};

module.exports = Generator.extend({
  prompting: function () {
    var done = this.async();

    this.prompt([{
      type    : 'input',
      name    : 'main',
      message : 'Main HTML file for your app',
      default : 'electron-main.js'
    }, {
      type    : 'input',
      name    : 'baseURL',
      message : 'The URL of the service layer',
      default : undefined
    }, {
      type: 'checkbox',
      name: 'friendlyPlatforms',
      message: 'What platforms would you like to support?',
      choices: [{
        name: 'MacOS',
        checked: platform.macos
      }, {
        name: 'Windows',
        checked: platform.windows
      }, {
        name: 'Linux',
        checked: platform.linux
      }]
    }, {
      type: 'checkbox',
      name: 'friendlyArchs',
      message: 'What architectures would you like to support?',
      choices: [{
        name: '32-bit (x86)',
        checked: arch['32']
      }, {
        name: '64-bit (x64)',
        checked: arch['64']
      }]
    }]).then(function (answers) {
      var platforms = answers.friendlyPlatforms.map(getSupportedPlatform);
      var archs = answers.friendlyArchs.map(getSupportedArch);

      this.config.set('main', answers.main);
      this.config.set('platforms', platforms);
      this.config.set('archs', archs);
      this.config.set('baseURL', answers.baseURL);
      done();
    }.bind(this));
  },

   installingElectron: function() {
     this.npmInstall(['electron'], { 'saveDev': true });
   },

   installingStealElectron: function() {
     this.npmInstall(['steal-electron'], { 'saveDev': true });
   },

  writing: function () {
    var done = this.async();
    var buildJsDeferred = Q.defer();
    var packageJsonDeferred = Q.defer();
    var options = {
      platforms: this.config.get('platforms'),
      archs: this.config.get('archs')
    };

    // update build.js
    var buildJs = this.destinationPath('build.js');
    if (!this.fs.exists(buildJs)) {
      this.fs.copyTpl(
        this.templatePath('build.ejs'),
        buildJs,
        options
      );
      buildJsDeferred.resolve();
    } else {
      fs.readFile(buildJs, 'utf8', function(err, data) {
        var commentStartText = this.fs.read(this.templatePath('commentStart.ejs'), 'utf8'),
            commentEndText = this.fs.read(this.templatePath('commentEnd.ejs'), 'utf8'),
            electronOptionsText = this.fs.read(this.templatePath('electronOptions.ejs'), 'utf8'),
            commentStartIndex = data.indexOf(commentStartText),
            commentEndIndex = data.indexOf(commentEndText),
            newContent;

        if (commentStartIndex < 0 && commentEndIndex < 0) {
            // add electronOptions
            newContent = data +
                ejs.render(commentStartText, options) +
                ejs.render(electronOptionsText, options) +
                ejs.render(commentEndText, options);
        } else {
            // replace existing electronOptions
            newContent = data.substring(data, commentStartIndex) +
                ejs.render(commentStartText, options) +
                ejs.render(electronOptionsText, options) +
                ejs.render(commentEndText, options) +
                data.substring(commentEndIndex + commentEndText.length);
        }

        fs.writeFile(buildJs, newContent, function() {
          buildJsDeferred.resolve();
        });
      }.bind(this));
    }

    // update package.json
    var packageJson = this.destinationPath('package.json');
    fs.readFile(packageJson, 'utf8', function(err, data) {
      var json = data && JSON.parse(data) || {};
      json.main = this.config.get('main');

      if(this.config.get('baseURL')) {
        json.steal = json.steal || {};
        json.steal.envs = json.steal.envs || {};
        var electronEnv = json.steal.envs['electron-production'];
        if(!electronEnv) {
          electronEnv = json.steal.envs['electron-production'] = {};
        }
        electronEnv.serviceBaseURL = this.config.get('baseURL');
      }

      fs.writeFile(packageJson, JSON.stringify(json), function() {
        packageJsonDeferred.resolve();
      });
    }.bind(this));

    // complete writing once build.js and package.json are updated
    Q.all([
      buildJsDeferred.promise,
      packageJsonDeferred.promise
    ])
    .then(function() {
      done();
    });
  }
});
