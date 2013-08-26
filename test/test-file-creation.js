/* global beforeEach, describe, it */

'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var helpers = require('yeoman-generator').test;

describe('HTML5 Boilerplate Generator', function () {

    var h5bp;
    var tmpDir = path.join(__dirname, 'tmp');

    var customDir = path.join('x', 'y', 'z');
    var defaultCSSDir = 'css';
    var defaultDocDir = 'doc';
    var defaultImgDir = 'img';
    var defaultJSDir = 'js';

    var cssFiles = [
        'main.css',
        'normalize',
    ];

    var docFiles= [
        'TOC.md',
        'crossdomain.md',
        'css.md',
        'extend.md',
        'faq.md',
        'html.md',
        'js.md',
        'misc.md',
        'usage.md',
    ];

    var jsFiles = [
        'jquery',
        'main.js',
        'modernizr',
        'plugins.js'
    ];

    var rootFiles = [
        '.gitattributes',
        '.gitignore',
        '.htaccess',
        '404.html',
        'apple-touch-icon',
        'crossdomain.xml',
        'favicon.ico',
        'humans.txt',
        'index.html',
        'robots.txt'
    ];

    var tmpFile = 'tmp';

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	beforeEach(function (done) {

		var deps = [ '../../app' ];

		helpers.testDirectory(tmpDir, function (error) {
			if ( error ) {
                return done(error);
            }
			h5bp = helpers.createGenerator('h5bp:app', deps);
			done();
		});

	});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// | Helper Functions                                                           |
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function checkExistenceOfFiles(dirName, expectedFiles) {
        fs.readdir(path.join(tmpDir, dirName), function (error, files) {
            files.forEach(function (file) {

                var found = false;

                if ( fs.lstatSync(path.join(tmpDir, dirName, file)).isDirectory() ) {
                    checkExistenceOfFiles(path.join(path.join(dirName, file)), expectedFiles);
                } else {
                    expectedFiles.some(function (el) {
                        if ( file.indexOf(el) === 0 ) {
                            found = true;
                            return true;
                        }
                    });
                    assert.equal(true, found);
                }

            });
        });
    }

    function createArray(obj) {
        var result = [];
        obj.forEach(function (el) {
            result.push(el);
        });
        return result;
    }


    function testPrompt(input, expectedFiles, dirName) {

        var fileNames = '';
        var i = 0;
        var numberOfExpectedFiles = expectedFiles.length;
        var text = '';

        for ( i = 0; i < numberOfExpectedFiles; i++ ) {
            fileNames += '`' + expectedFiles[i] + '`' ;
            if ( i < numberOfExpectedFiles - 2 ) {
                fileNames += ', ';
            } else if ( i === numberOfExpectedFiles - 2 ) {
                fileNames += ' and ';
            }

        }

        text = ( fileNames === '' ? 'should not copy anything' : 'should only copy ' + fileNames) + ( dirName === '' ? dirName : ' into `' + dirName + '` directory');


        it(text, function (done) {

            helpers.mockPrompt(h5bp, input);
            h5bp.run({}, function () {

                if ( dirName !== '' ) {
                    // directory is copied
                    helpers.assertFile(dirName);
                }

                // and it contains only the expected files
                checkExistenceOfFiles(dirName, expectedFiles);

                if ( dirName !== '' ) {
                    // and only the directory is copied and nothing else
                    fs.readdir(path.join(__dirname, tmpFile), function(error, files){
                        assert.equal(files.length, 1);
                    });
                }

                done();

            });
        });
    }




    function createXArray(obj, cb) {

        var result = [];

        var i = 0, j = 0;
        var fileNames = createArray(obj);
        var f = [];

        for ( i = 0; i < fileNames.length; i++ ) {
            for ( j = i; j < fileNames.length; j++ ) {
                f = fileNames.slice(0, i);
                f.push(fileNames[j]);
                cb(f,f);
            }
        }

    }


    function xyyyy(input) {
        var files =  input.files;

        it('...', function (done) {
            helpers.mockPrompt(h5bp, input);
            h5bp.run({}, function () {
                var fileContent = fs.readFileSync('index.html', 'utf8');

                assert.equal(files.indexOf('normalize') !== -1, /<link rel="stylesheet" href="css\/normalize.css">/.test(fileContent));
                assert.equal(files.indexOf('main.css') !== -1, /<link rel="stylesheet" href="css\/main.css">/.test(fileContent));
                assert.equal(files.indexOf('modernizr') !== -1, /<script src="js\/vendor\/modernizr.*.min.js"><\/script\>/.test(fileContent));
                assert.equal(files.indexOf('jquery') !== -1, /<script src="\/\/ajax.googleapis.*jquery.min.js"><\/script\>/.test(fileContent));
                //assert.equal(files.indexOf('jquery') !== -1, /<script>window.jQuery.*jquery-.*.min.js"><\/script>'\)<\/script\>/.test(fileContent));
                assert.equal(files.indexOf('plugins.js') !== -1, /<script src="js\/plugins.js">/.test(fileContent));
                assert.equal(files.indexOf('main.js') !== -1, /<script src="js\/main.js">/.test(fileContent));

                //assert.equal(input['google-analytics'] === true, /<!--\s*Google.*-->/.test(fileContent));
                //console.log(fileContent);
                //assert.equal(input['google-analytics'] === true, /<script>.*\(function\(.*<\/script>/.test(fileContent));

                done();
            });
        });
    }


// -----------------------------------------------------------------------------
// | Tests                                                                     |
// -----------------------------------------------------------------------------
//
//
/*
	function xx() {
        it('aaa', function(done) {
            h5bp.options = {
                'default': true,
                'cssdir': 'x',
                'argv': { 'remain': [] }
            };
            console.log('yey!');
            h5bp.run({}, function () {
                done();
            });
        });
	}

    xx();
*/

    describe('Prompt', function () {

        describe('Root files', function () {
            createXArray(rootFiles, function(input, expectedFiles) {
                testPrompt({ 'files': input }, expectedFiles, '');
            });
        });

        describe('CSS files', function () {

            // test for default CSS directory
            createXArray(cssFiles, function(input, expectedFiles) {
                testPrompt({ 'files': input }, expectedFiles, defaultCSSDir);
            });

            // test for custom CSS directory
            createXArray(cssFiles, function(input, expectedFiles) {
                testPrompt({ 'files': input, 'cssDir': customDir }, expectedFiles, customDir);
            });

        });

        describe('JavaScript files', function () {

            // test for default JavaScript directory
            createXArray(jsFiles, function(input, expectedFiles) {
                testPrompt({ 'files': input }, expectedFiles, defaultJSDir);
            });

            // test for custom JavaScript directory
            createXArray(jsFiles, function(input, expectedFiles) {
                testPrompt({ 'files': input, 'jsDir': customDir }, expectedFiles, customDir);
            });

        });

        describe('Documentation files', function () {

            // test for no documentation
            testPrompt({ 'doc': false }, [], '');

            // test for default documentation directory
            testPrompt({ 'doc': true }, docFiles, defaultDocDir);

            // test for custom documentation directory
            testPrompt({ 'doc': true, 'docDir': customDir }, docFiles, customDir);

        });


        describe('.htaccess & 404 page', function () {

            // test for when only .htaccess is copied
            it('.htaccess should have `ErrorDocument` commented', function (done) {
                helpers.mockPrompt(h5bp, { 'files': [ '.htaccess' ]});
                h5bp.run({}, function () {
                    helpers.assertFile('.htaccess', /^# ErrorDocument/m);
                    done();
                });
            });

            // test for when only .htaccess and 404.html is copied
            it('.htaccess should have `ErrorDocument` uncommented', function (done) {
                helpers.mockPrompt(h5bp, { 'files': [ '.htaccess', '404.html' ]});
                h5bp.run({}, function () {
                    helpers.assertFile('.htaccess', /^ErrorDocument/m);
                    done();
                });
            });

        });

        describe('index.html + different choice', function () {

            var files = cssFiles.concat(jsFiles);

            // test for index.html + different files
            createXArray(files, function(input, expectedFiles) {
                var input = { 'files': input.concat(['index.html']) };
                xyyyy(input);
            });

            // test for index.html + different files + ga
            createXArray(files, function(input, expectedFiles) {
                var input = { 'files': input.concat(['index.html']), 'google-analytics': true };
                xyyyy(input);
            });

        });

    });


});
