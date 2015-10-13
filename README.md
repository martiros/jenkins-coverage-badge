# jenkins-php-coverage-badge

The MISSING [shields.io](http://shields.io) badge, Jenkins-coverage.

This tiny web server will generate your Clover PHP Plugin badge!

Copy `config.example.js` to `config.js` and set configuration options.


## Install & Run
```bash
$ npm install
$ node server.js 
```

Now you can get coverage badge with

`http://host:port/project/:job/coverage/badge`

and link to coverage report

`http://host:port/project/:job/coverage/report`

## Example

[![Code Coverage](https://img.shields.io/badge/coverage-80%-brightgreen.svg)](http://host:port/project/:job/coverage/report) 
```
[![Code Coverage](http://host:port/project/:job/coverage/badge)](http://host:port/project/:job/coverage/report)
```
