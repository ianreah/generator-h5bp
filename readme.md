# HTML5 Boilerplate generator [![Build Status](https://secure.travis-ci.org/ianreah/generator-h5bp.png?branch=master)](http://travis-ci.org/ianreah/generator-h5bp)

Scaffolds out [HTML5 Boilerplate](http://html5boilerplate.com) with the following differences...

- Uses [requirejs](http://requirejs.org/) for module loading
- Includes some basic [grunt](http://gruntjs.com/) tasks...

```
Available tasks
        jshint  Validate files with JSHint. *                                  
       jasmine  Run jasmine specs headlessly through PhantomJS. *              
         watch  Run predefined tasks whenever watched files change.   
         bower  Wire-up Bower components in RJS config *                       
```

- Includes [bower](http://bower.io/) for managing front-end components. Install a component with `bower install ____ --save` then run `grunt bower` to automatically add the paths to the requirejs config.
- *Doesn't* include [jquery](http://jquery.com/) out of the box. Install it with bower as described above if/when it's needed.

## Getting started

It hasn't been published so a normal `npm install` won't work. Installing from the github repo url is also problematic because of the submodule. The simplest solution I've found is to clone the repo and do an `npm link`...

- `git clone https://github.com/ianreah/generator-h5bp.git`
- `cd .\generator-h5bp`
- `git submodule update -i`
- `npm link`
- Run it (from any folder) with [yo](https://github.com/yeoman/yo): `yo h5bp`

## Related

You might also find the [Mobile Boilerplate](https://github.com/h5bp/generator-mobile-boilerplate) and [Server Configs](https://github.com/h5bp/generator-server-configs) generators useful.

## License

MIT License • © [Sindre Sorhus](http://sindresorhus.com)
