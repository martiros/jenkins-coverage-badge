#! /usr/bin/env node

var XRegExp = require('xregexp'),
    http = require('http'),
    request = require('request'),
    express = require('express'),
    config = require('./config'),
    BadgeStorage = require("./badge-storage");


var app = express();

function grabCoverageFromJenkins(cb, job) {
  var url = config.jenkins.host + '/job/' + job + '/';
  var auth = "Basic " + new Buffer(config.jenkins.username + ":" + config.jenkins.password).toString("base64");
  request(
      {
        url : url,
        headers : {
          "Authorization" : auth
        }
      },
      function (error, response, body) {
        if (error || response.statusCode != 200) {
          return cb(null);
        }

        var regex = XRegExp('Code Coverage - (?<percent>.*?)% \(.*?/.*? elements\)', 'g'),
            match = XRegExp.exec(body, regex),
            codeCoverage = match ? parseInt(match.percent) : null;

        return cb(codeCoverage);
      }
  );
}

app.get('/project/:job/coverage/badge', function(req,res) {

  var job = req.params.job;
  grabCoverageFromJenkins(
      function(codeCoverage){

          BadgeStorage.getBadge(function (badge){

              if (!badge) {
                  return res.status(500).send('Internal server error');
              }

              res.set('Content-Disposition', 'inline; filename="'+badge.filename+'"');
              res.set('Content-Type', badge.filetype);

              res.set('Cache-Control', 'no-cache, private');
              res.set('Pragma', 'no-cache');
              res.set('Etag', badge.id);
              res.setHeader('Last-Modified', (new Date()).toUTCString());

              res.send(badge.body);

          }, codeCoverage);

      },
      job
  );
});

app.get('/project/:job/coverage/report', function(req,res) {
  res.redirect(config.jenkins.host + '/job/' + req.params.job + '/cloverphp/');
});

var server = http.createServer(app);
server.listen(config.server.port, function(){
    console.log('Express server listening on port ' + server.address().port);
});
