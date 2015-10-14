var md5 = require('md5'),
    url = require("url"),
    path = require("path"),
    request = require('request');

var cachedBadges = {};
var SHIELDS_IO_TYPES = ['plastic', 'flat', 'flat-square', 'social'];
var CACHE_TIME = 60 * 60 * 1000; // 1 hour

function getCoverageBadgeUrl(percent, style) {
    var noCoverageUrl = 'https://img.shields.io/badge/coverage-none-lightgrey.svg';
    percent = parseInt(percent);
    if (!percent) {
        return noCoverageUrl;
    }

    var color = getCoverageBadgeColor(percent);
    var badgeUrl = 'https://img.shields.io/badge/coverage-' + percent.toString() + '%-' + color + '.svg'

    if (style || SHIELDS_IO_TYPES.indexOf(style)) {
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

function isExpiredCache(cachedBadge) {
    if (cachedBadge.createdAt.getTime() + CACHE_TIME < (new Date().getTime()) ) {
        return true;
    }
    return false;
}

var BadgeStorage = {
    getBadge: function(cb, coveragePercent, style) {

        var badgeUrl = getCoverageBadgeUrl(coveragePercent, style);
        if (!badgeUrl) {
            return cb(null);
        }

        if (cachedBadges[badgeUrl] && !isExpiredCache(cachedBadges[badgeUrl])) {
            return cb(cachedBadges[badgeUrl]);
        }

        request(
            {url : badgeUrl},
            function (error, response, body) {

                if (error || response.statusCode != 200) {
                    return cb(null);
                }

                var parsed = url.parse(badgeUrl);
                var badgeFileName = path.basename(parsed.pathname);
                cachedBadges[badgeUrl] = {
                    id: md5(badgeUrl + Math.random()),
                    body: body,
                    filename: badgeFileName,
                    filetype: 'image/svg+xml',
                    createdAt: new Date()
                };
                cb(cachedBadges[badgeUrl]);
            }
        );
    }
};

module.exports = BadgeStorage;
