var util = require('util'),
    format = util.format;
var restify = require('restify');
var async = require('async');
var querystring = require('querystring');
var bunyan = require('bunyan');

function Strava(options) {
    var log = options.log || bunyan.createLogger({name: 'node-strava'});
    this.restifyClient = restify.createJsonClient({
        url: 'https://www.strava.com'
    });
    this.log = log;
    this.token = options.token;
}

Strava.prototype.listActivities = function listActivities(callback) {
    var self = this;
    var options = {
        path: '/api/v3/athlete/activities',
        headers: {
            'Authorization': 'Bearer ' + self.token
        }
    }

    options.query = {
        page: 1,
        per_page: 100
    };

    var activities = [];
    var finished = false;
    async.until(function () {
        return finished;
    }, function (untilcb) {
        self.restifyClient.get(options, function (err, req, res, obj) {
            if (err) return untilcb(err);
            if (obj.length < options.query.per_page) {
                finished = true;
            } else {
                options.query.page++;
            }
            activities = activities.concat(obj.filter(function (activity) {
                return activity.type == 'Ride';
            }));
            untilcb();
        });
    }, function (err) {
        if(err) callback(err);
        callback(null, activities);
    });
};

Strava.prototype.getAthlete = function getAthlete(callback) {
    var self = this;
    var options = {
        path: '/api/v3/athlete',
        headers: {
            'Authorization': 'Bearer ' + self.token
        }
    }
    self.restifyClient.get(options, function (err, req, res, obj) {
        if(err) callback(err);
        callback(null, obj);
    });
};

Strava.prototype.oauth = function oath(params, callback) {
    var self = this;
    var options = {
        path: '/oauth/token'
    }
    self.restifyClient.post(options, params, function(err, req, res, obj) {
        if(err) callback(err);
        callback(null, obj);
    });
};

Strava.prototype.deauthorize = function deauthorize(callback) {
    var self = this;
    var options = {
        path: '/oauth/deauthorize',
        headers: {
            'Authorization': 'Bearer ' + self.token
        }
    }
    self.restifyClient.post(options, function(err, req, res, obj) {
        if(err) callback(err);
        callback(null, obj);
    });
};

module.exports = Strava;
