var path = require('path');
var helpers = require('yeoman-test');
var assert = require('assert');
var fs = require('fs-extra');

describe('donejs-electron', function() {
  describe('should create/update build.js', function() {
    describe('when no build.js exists', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
          .withPrompts({
            platforms: ['x'],
            archs: ['y']
          })
          .on('end', done);
      });

      it('should write build.js', function() {
        assert.file(['build.js']);
        assert.fileContent('build.js', /steal-tools/);
        assert.fileContent('build.js', /steal-electron/);
        assert.fileContent('build.js', /platforms: \["x"\]/);
        assert.fileContent('build.js', /archs: \["y"\]/);
      });
    });

    describe('when build.js was already created by generator-donejs', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
        .withPrompts({
          platforms: ['x'],
          archs: ['y']
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
        assert.fileContent('build.js', /platforms: \["x"\]/);
        assert.fileContent('build.js', /archs: \["y"\]/);
      });
    });

    describe('when build.js was already created by generator-donejs and updated by donejs-electron', function() {
      before(function(done) {
        helpers.run(path.join(__dirname, '..', 'default'))
          .withPrompts({
            platforms: ['x'],
            archs: ['y']
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
        assert.fileContent('build.js', /platforms: \["x"\]/);
        assert.fileContent('build.js', /archs: \["y"\]/);
        assert.noFileContent('build.js', /previous electron options/);
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
          platforms: ['x'],
          archs: ['y'],
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
          platforms: ['x'],
          archs: ['y'],
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
          platforms: ['x'],
          archs: ['y'],
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
