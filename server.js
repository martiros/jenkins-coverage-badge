#! /usr/bin/env node

var XRegExp = require('xregexp'),
    request = require('request'),
    express = require('express'),
    config = require('./config');


var app = express();

function getCoverageBadgeUrl(percent, style) {
  var noCoverageUrl = 'https://img.shields.io/badge/coverage-none-lightgrey.svg';
  percent = parseInt(percent);
  if (!percent) {
    return noCoverageUrl;
  }

  var color = getCoverageBadgeColor(percent);
  var badgeUrl = 'https://img.shields.io/badge/coverage-' + percent.toString() + '%-' + color + '.svg'

  if (style) {
    badgeUrl += '?style=' + style;
  }
  return badgeUrl;
}

function getCoverageBadgeColor(percent) {
  if (percent < 20) {
    return 'red'
  } else if (percent < 80) {
    return 'yellow'
  }
  return 'brightgreen'
}

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
            codeCoverage = match ? match.percent : null;

        return cb(getCoverageBadgeUrl(codeCoverage));
      }
  );
}

app.get('/project/:job/coverage/badge', function(req,res) {

  var job = req.params.job;
  grabCoverageFromJenkins(
      function(url){
        res.redirect(url);
      },
      job
  );
});

app.get('/project/:job/coverage/report', function(req,res) {
  res.redirect(config.jenkins.host + '/job/' + req.params.job + '/cloverphp/');
});


var server = app.listen(config.server.port, function() {
  console.log('Listening on port %d...', server.address().port)
});
