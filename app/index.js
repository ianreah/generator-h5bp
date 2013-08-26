'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');

var cheerio = require('cheerio');
var yeoman = require('yeoman-generator');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var H5BPGenerator = module.exports = function H5BPGenerator() {
    yeoman.generators.Base.apply(this, arguments);
};

util.inherits(H5BPGenerator, yeoman.generators.NamedBase);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

H5BPGenerator.prototype._convertObject = function (obj) {

    var defaultOpt = obj.default === true;
    var result = {

        'files': [],

        cssDir: obj.cssdir ? 'css' : obj.cssdir,
        docDir: obj.docdir ? 'doc' : obj.docdir,
        imgDir: obj.imgdir ? 'img' : obj.imgdir,
        jsDir:  obj.jsdir  ?  'js' : obj.jsdir,

        'ga': this._detVal(defaultOpt, obj.ga),
        'doc': this._detVal(defaultOpt, obj.doc)
    };

    this._detVal(defaultOpt, obj.gitattributes) === true ? result.files.push('.gitattributes') : '';
    this._detVal(defaultOpt, obj.gitignore) === true ? result.files.push('.gitignore') : '';
    this._detVal(defaultOpt, obj.htaccess) === true ? result.files.push('.htaccess') : '';
    this._detVal(defaultOpt, obj.index) === true ? result.files.push('index.html') : '';
    this._detVal(defaultOpt, obj.jquery) === true ? result.files.push('jquery') : '';
    this._detVal(defaultOpt, obj['404']) === true ? result.files.push('404.html') : '';
    this._detVal(defaultOpt, obj['apple-touch-icons']) === true ? result.files.push('apple-touch-icon') : '';
    this._detVal(defaultOpt, obj['crossdomain-xml']) === true ? result.files.push('crossdomain.xml') : '';
    this._detVal(defaultOpt, obj.favicon) === true ? result.files.push('favicon.ico') : '';
    this._detVal(defaultOpt, obj['humans-txt']) === true ? result.files.push('humans.txt') : '';
    this._detVal(defaultOpt, obj['main-css']) === true ? result.files.push('main.css') : '';
    this._detVal(defaultOpt, obj['main-js']) === true ? result.files.push('main.js') : '';
    this._detVal(defaultOpt, obj.modernizr) === true ? result.files.push('modernizr') : '';
    this._detVal(defaultOpt, obj.normalize) === true ? result.files.push('normalize') : '';
    this._detVal(defaultOpt, obj['plugins-js']) === true ? result.files.push('plugins.js') : '';
    this._detVal(defaultOpt, obj['robots-txt']) === true ? result.files.push('robots.txt') : '';

    return result;

};

H5BPGenerator.prototype._copyDir = function (srcDir, destDir, listOfFilesToCopy, recursive) {

    var cwd = path.join(this.sourceRoot(), srcDir);

    this.expand( '*', {
        cwd: cwd,
        dot: true
    }).forEach(function (file) {

        // if directory
        if ( fs.lstatSync(path.join(cwd, file)).isDirectory() === true ) {
            if ( recursive === true ) {
                this._copyDir(path.join(srcDir, file), path.join(destDir, file), listOfFilesToCopy, recursive);
            }

        // if file
        } else {

            // if `listOfFilesToCopy` is specified, check if the
            // current `file` is in that list, and if it is, copy it
            if ( listOfFilesToCopy !== undefined ) {
                listOfFilesToCopy.some(function (f) {
                    if ( file.indexOf(f) === 0 ) {
                        console.log(file);
                        this.copy(path.join(srcDir, file), path.join(destDir, file));
                        return true;
                    }
                }.bind(this));

            // else just copy the `file`
            } else {
                this.copy(path.join(srcDir, file), path.join(destDir, file));
            }
        }

    }, this);

};



H5BPGenerator.prototype._detVal = function (defaultOpt, value) {
    if ( value === true ||
         // if the `default` comment line option is true,
         // all other posible options are true by default
         defaultOpt === true && value === undefined ) {
        return true;
    }
    return false;
};

H5BPGenerator.prototype._updatePaths = function (selector, attribute, cheerio, srcDir, destDir, files) {
    files.forEach(function (file) {
        var elem = cheerio(selector + '[' + attribute + '*="' + file + '"]' +
                                      '[' + attribute + '^="' + srcDir + '"]');
        if ( srcDir !== destDir &&
             elem.attr(attribute) !== undefined ) {
            elem.attr(attribute, elem.attr(attribute).replace(srcDir, destDir));
        }
        elem.attr('data-checked', '');
    });
};

H5BPGenerator.prototype._updateIndexFile = function (choices) {

    var $ = cheerio.load(this.readFileAsString(path.join(this.sourceRoot(), 'index.html'))),
        inlineScripts = $('script:not([src])'),
        jQueryInlineScript = inlineScripts.eq(0),
        gaInlineScript = inlineScripts.eq(1),
        fileContent = '';

    // everthiing that will remain in the page  mark as "data-checked"

    // update paths
    this._updatePaths('link', 'href', $, 'css', choices.cssDir, choices.files);
    this._updatePaths('script', 'src', $, 'js', choices.jsDir, choices.files);

    // jQuery and the Google Analytics snippet require special treatment
    if ( choices.files.indexOf('jquery') !== -1 ) {
        $('script[src$="jquery.min.js"]').attr('data-checked','');
        //console.log('--->',jQueryInlineScript.html().toString());
        jQueryInlineScript.html(jQueryInlineScript.html().replace('js', choices.jsDir));
        jQueryInlineScript.attr('data-checked','');
    }

    if ( choices.ga === true ) {
        gaInlineScript.attr('data-checked','');
    }

    // remove unmarked scripts and stylesheets
    $('link:not([data-checked])').remove();
    $('script:not([data-checked])').remove();
    $('[data-checked]').removeAttr('data-checked');

    fileContent = $.html();

    // Remove
    if ( choices.ga !== true ) {
        // remove the `Google Analytics` comment
        // ( you can do this using `parseHTML` but it's way to
        //   much code and also way worse in terms of performance )
        fileContent = fileContent.replace(/<!--\s*Google\sAnalytics.*-->/g, '');
    }

    fileContent = fileContent.replace(/(^\s+\n){2}/gm, '\n');

    this.write('index.html', fileContent);

};

H5BPGenerator.prototype._updateHtaccessFile = function (choices) {
    if ( choices.files.indexOf('404.html') !== -1 ) {
        this._copyDir('', '', [ '.htaccess' ]);
    } else {
        this.write('.htaccess', this.read('.htaccess').replace(/ErrorDocument/g, '# ErrorDocument'));
    }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

H5BPGenerator.prototype.getUserChoices = function () {

	var cb = this.async();
    var fileChoices = [

        // Git
        {
            name: '.gitattributes',
            value: '.gitattributes',
        },
        {
            name: '.gitignore',
            value: '.gitignore',
        },

        new yeoman.inquirer.Separator(),

        // Miscellaneous
        {
            name: '.htaccess',
            value: '.htaccess',
        },
        {
            name: '404.html',
            value: '404.html',
        },
        {
            name: 'apple-touch-icon',
            value: 'apple-touch-icon',
            checked: true
        },
        {
            name: 'crossdomain.xml',
            value: 'crossdomain.xml',
        },
        {
            name: 'favicon.ico',
            value: 'favicon.ico',
            checked: true
        },
        {
            name: 'humans.txt',
            value: 'humans.txt',
            checked: true
        },
        {
            name: 'index.html',
            value: 'index.html',
            checked: true
        },
        {
            name: 'robots.txt',
            value: 'robots.txt',
            checked: true
        },

        new yeoman.inquirer.Separator(),

        // CSS
        {
            name: 'main.css',
            value: 'main.css',
            checked: true
        },
        {
            name: 'normalize.css',
            value: 'normalize',
            checked: true
        },

        new yeoman.inquirer.Separator(),

        // JavaScript
        {
            name: 'jQuery',
            value: 'jquery',
            checked: true
        },
        {
            name: 'main.js',
            value: 'main.js',
            checked: true
        },
        {
            name: 'Modernizr',
            value: 'modernizr',
            checked: true
        },
        {
            name: 'plugins.js',
            value: 'plugins.js',
            checked: true
        },

        new yeoman.inquirer.Separator(),
    ];

    var primaryQuestions = [
        {
            choices: fileChoices,
            message: 'Which files do you want to include ?',
            name: 'files',
            type: 'checkbox'
        },
        {
            default: false,
            message: 'Would you like to include the documentation ?',
            name: 'doc',
            type: 'confirm'
        }
    ];

    var cssDirQuestion = {
        default: 'css',
        message: 'Where do you want the CSS files to be stored ?',
        name: 'cssDir',
        type: 'input'
    };

    var docDirQuestion = {
        default: 'doc',
        message: 'Where do you want the documentation files to be stored?',
        name: 'docDir',
        type: 'input'
    };

    var imgDirQuestion = {
        default: 'img',
        message: 'Where do you want the images to be stored ?',
        name: 'imgDir',
        type: 'input'
    };

    var jsDirQuestion = {
        default: 'js',
        message: 'Where do you want the JavaScript files to be stored ?',
        name: 'jsDir',
        type: 'input'
    };

    var emptyCSSDirQuestion = {
        default: false,
        message: 'Would you like an empty directory for CSS files ?',
        name: 'emptyCSSDir',
        type: 'confirm'
    };

    var emptyImgDirQuestion = {
        default: false,
        message: 'Would you like an empty directory for images ?',
        name: 'emptyImgDir',
        type: 'confirm',
    };

    var emptyJSDirQuestion = {
        default: false,
        message: 'Would you like an empty directory for JavaScript files ?',
        name: 'emptyJSDir',
        type: 'confirm',
    };

    var emptyDocDirQuestion = {
        default: false,
        message: 'Would you like an empty directory for documentation files ?',
        name: 'emptyDocDir',
        type: 'choices',
    };

    var gaQuestion = {
        type: 'confirm',
        name: 'ga',
        message: 'Would you to include Google Analytics ?',
        default: false
    };

    console.log(this.options);

    // process command-line options
    if ( this.options.argv && this.options.argv.remain.length === 0 ) {

        // transform the nopt (https://github.com/isaacs/nopt) object
        // into one that is the same as the one generated by the prompt
        this.choices = this._convertObject(this.options);
        cb();

    // process prompt options
    } else {

        this.prompt(primaryQuestions, function (choices) {

            var files;
            var otherQuestions = [];

            this.choices = choices;
            this.choices.files = choices.files || [];

            files = this.choices.files;

            // based on the answers from the first round
            // of questions create a new round of questions

            // if the user wants the docs files ask about
            // where he would want them to be
            if ( choices.doc === true ) {
                otherQuestions.push(docDirQuestion);
            }

            // Google Analytics
            if ( files.indexOf('index.html') !== -1 ) {
                otherQuestions.push(gaQuestion);
            }

            // CSS directory
            if ( files.indexOf('main.css') !== -1 ||
                 files.indexOf('normalize') !== -1 ) {
                otherQuestions.push(cssDirQuestion);
            } else {
                otherQuestions.push(emptyCSSDirQuestion);
            }

            // js dir
            if ( files.indexOf('jquery') !== -1 ||
                 files.indexOf('main.js') !== -1 ||
                 files.indexOf('modernizr') !== -1 ||
                 files.indexOf('plugins.js') !== -1 ) {
                otherQuestions.push(jsDirQuestion);
            } else {
                otherQuestions.push(emptyJSDirQuestion);
            }

            // Img directory
            otherQuestions.push(emptyImgDirQuestion);

            this.prompt(otherQuestions, function (choices2) {

                // Documentation directory
                if ( this.choices.doc === true ) {
                    this.choices.docDir = choices2.docDir || 'doc';
                }

                // CSS directory
                if ( files.indexOf('main.css') !== -1 ||
                     files.indexOf('normalize') !== -1 ) {
                    this.choices.cssDir = choices2.cssDir || 'css';
                }

                // JavaScript directory
                if ( files.indexOf('jquery') !== -1 ||
                    files.indexOf('main.js') !== -1 ||
                    files.indexOf('modernizr') !== -1 ||
                    files.indexOf('plugins.js') !== -1 ) {
                    this.choices.jsDir = choices2.jsDir || 'js';
                }

                // Google Analytics
                this.choices.ga = choices2.ga;


                cb();
            }.bind(this));

        }.bind(this));
    }

};

H5BPGenerator.prototype.copyFiles = function () {

    var files = this.choices.files.slice(0);

    // yeoman's actions#write doesn't have a option to force write,
    // and it can be anoying to aske the user if it want it overwrite,
    // files that we modify so if the following files are choosen by the users
    // ignore them till later
    // https://github.com/yeoman/generator/wiki/base#actionswrite
    if ( files.indexOf('.htaccess') !== -1 ) {
        files.splice(files.indexOf('.htaccess'), 1);
    }

    if ( files.indexOf('index.html') !== -1 ) {
        files.splice(files.indexOf('index.html'), 1);
    }

    // root files
    this._copyDir('', '', files);

    // documentation files
    if ( this.choices.docDir !== undefined ) {
        this._copyDir('doc', this.choices.docDir);
    }

    // CSS files
    if ( this.choices.cssDir !== undefined ) {
        this._copyDir('css', this.choices.cssDir, files);
    }

    // JavaScript Files
    if ( this.choices.jsDir !== undefined ) {
        this._copyDir('js', this.choices.jsDir, files, true);
    }

};

H5BPGenerator.prototype.updateFiles = function () {

    if ( this.choices.files.indexOf('index.html') !== -1 ) {
        this._updateIndexFile(this.choices);
    }

    if ( this.choices.files.indexOf('.htaccess') !== -1 ) {
        this._updateHtaccessFile(this.choices);
    }

};
