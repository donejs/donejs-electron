var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var fs = require('fs-extra');

describe('donejs-electron', function() {
  describe('should create/update build.js', function() {
    describe('when no build.js exists', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
          .withPrompts({
            friendlyPlatforms: ['MacOS'],
            friendlyArchs: ['32-bit (x86)']
          })
          .on('end', done);
      });

      it('should write build.js', function() {
        assert.file(['build.js']);
        assert.fileContent('build.js', /steal-tools/);
        assert.fileContent('build.js', /steal-electron/);
        assert.fileContent('build.js', /main: "electron-main.js"/);
        assert.fileContent('build.js', /platforms: \["darwin"\]/);
        assert.fileContent('build.js', /archs: \["ia32"\]/);
        assert.fileContent('build.js', /buildElectron/);
        assert.fileContent('build.js', /map ?/);
      });
    });

    describe('when build.js was already created by generator-donejs', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
        .withPrompts({
          main: 'my-electron-main.js',
          friendlyPlatforms: ['Windows'],
          friendlyArchs: ['64-bit (x64)']
        })
        .inTmpDir(function(dir) {
          var done = this.async();
          fs.copy(path.join(__dirname, 'templates/generator-donejs'), dir, done);
        })
        .on('end', done);
      });

      it('should add electronOptions to build.js', function() {
        assert.file(['build.js']);
        assert.fileContent('build.js', /generator-donejs build\.js/);
        assert.fileContent('build.js', /steal-tools/);
        assert.fileContent('build.js', /steal-electron/);
        assert.fileContent('build.js', /main: "my-electron-main.js"/);
        assert.fileContent('build.js', /platforms: \["win32"\]/);
        assert.fileContent('build.js', /archs: \["x64"\]/);
        assert.fileContent('build.js', /var buildElectron/);
        assert.fileContent('build.js', /var buildCordova/);
        assert.fileContent('build.js', /map ?/);
      });
    });

    describe('when build.js was already created by generator-donejs and updated by donejs-electron', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
          .withPrompts({
            friendlyPlatforms: ['MacOS', 'Linux'],
            friendlyArchs: ['32-bit (x86)', '64-bit (x64)']
          })
          .inTmpDir(function(dir) {
            var done = this.async();
            fs.copy(path.join(__dirname, 'templates/donejs-electron'), dir, done);
          })
          .on('end', done);
      });

      it('should replace existing donejs-electron options', function() {
        assert.file(['build.js']);
        assert.fileContent('build.js', /generator-donejs \+ donejs-electron build\.js/);
        assert.fileContent('build.js', /steal-tools/);
        assert.fileContent('build.js', /steal-electron/);
        assert.fileContent('build.js', /main: "electron-main.js"/);
        assert.fileContent('build.js', /platforms: \["darwin","linux"\]/);
        assert.fileContent('build.js', /archs: \["ia32","x64"\]/);
        assert.noFileContent('build.js', /previous electron options/);
        assert.fileContent('build.js', /var buildElectron/);
        assert.fileContent('build.js', /var buildCordova/);
        assert.fileContent('build.js', /map ?/);
      });
    });
  });

  describe('should update package.json', function() {
    it('with correct electron configuration when steal config is empty', function(done) {
      helpers.run(path.join(__dirname, '..', 'default'))
        .inTmpDir(function(dir) {
          var done = this.async();
          fs.writeJson(path.join(dir, 'package.json'), {
            main: 'foo.js',
            steal: { }
          }, done);
        })
        .withPrompts({
          main: 'my-electron-main.js',
          friendlyPlatforms: ['x'],
          friendlyArchs: ['y'],
          baseURL: 'https://foo.com'
        })
        .on('end', function() {
          assert.file(['package.json']);
          assert.JSONFileContent('package.json', { main: 'my-electron-main.js' });
          assert.JSONFileContent('package.json', { steal: { envs: { 'electron-production': {'serviceBaseURL': 'https://foo.com'}}}});
          done();
        });
    });

    it('with correct electron configuration when steal config doesn\'t exist', function(done) {
      helpers.run(path.join(__dirname, '..', 'default'))
        .inTmpDir(function(dir) {
          var done = this.async();
          fs.writeJson(path.join(dir, 'package.json'), {
            main: 'foo.js'
          }, done);
        })
        .withPrompts({
          main: 'my-electron-main.js',
          friendlyPlatforms: ['x'],
          friendlyArchs: ['y'],
          baseURL: 'https://foo.com'
        })
        .on('end', function() {
          assert.file(['package.json']);
          assert.JSONFileContent('package.json', { main: 'my-electron-main.js' });
          assert.JSONFileContent('package.json', { steal: { envs: { 'electron-production': {'serviceBaseURL': 'https://foo.com'}}}});
          done();
        });
    });

    it('with correct electron configuration when steal config exists', function(done) {
      helpers.run(path.join(__dirname, '..', 'default'))
        .inTmpDir(function(dir) {
          var done = this.async();
          fs.writeJson(path.join(dir, 'package.json'), {
            main: 'foo.js',
            steal: { }
          }, done);
        })
        .withPrompts({
          main: 'my-electron-main.js',
          friendlyPlatforms: ['x'],
          friendlyArchs: ['y'],
          baseURL: 'https://foo.com'
        })
        .on('end', function() {
          assert.file(['package.json']);
          assert.JSONFileContent('package.json', { main: 'my-electron-main.js' });
          assert.JSONFileContent('package.json', { steal: { envs: { 'electron-production': {'serviceBaseURL': 'https://foo.com'}}}});
          done();
        });
    });
  });
});
