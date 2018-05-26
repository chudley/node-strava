var mod_assertplus = require('assert-plus');
var mod_bunyan = require('bunyan');
var mod_extsprintf = require('extsprintf');
var mod_jsprim = require('jsprim');
var mod_querystring = require('querystring');
var mod_restify = require('restify');
var mod_util = require('util');
var mod_vasync = require('vasync');
var mod_verror = require('verror');

var format = mod_util.format;
var sprintf = mod_extsprintf.sprintf;

var STRAVA_API_URL = 'https://www.strava.com';
var STRAVA_API_PATH = '/api/v3';

function Strava(options) {
	mod_assertplus.object(options, 'options');
	mod_assertplus.string(options.token, 'options.token');

	if (options.log) {
		/*
		 * We're deleting serialisers from the parent here so that
		 * restify will use its own defaults, preventing
		 * restify/node-restify#358.
		 */

		delete (options.log.serializers);
		this.log = options.log.child({
		    'component': 'strava'
		});
	} else {
		this.log = mod_bunyan.createLogger({
		    'name': 'strava',
		    'level': 'info'
		});
	}

	this.client = mod_restify.createJsonClient({
	    'url': STRAVA_API_URL,
	    'log': this.log,
	    'headers': {
		'Authorization': sprintf('Bearer %s', options.token)
	    }
	});
}

Strava.prototype._get = function _get(endpoint, params, callback) {
	var self = this;

	if (typeof (params) === 'function') {
		callback = params;
		params = undefined;
	}

	var options = {
	    'path': sprintf('%s/%s', STRAVA_API_PATH, endpoint)
	};

	options = mod_jsprim.mergeObjects(params, options);

	self.log.trace({
	    'options': options
	}, 'starting: _get');

	self.client.get(options, function (err, req, res, obj) {
		if (err) {
			self.log.trace(err, 'error: _get');
			callback(err);
			return;
		}

		self.log.trace({
		    'req': req,
		    'res': res,
		    'obj': obj
		}, 'success: _get');

		callback(null, obj);
	});
};

Strava.prototype.listAthleteActivities = function listActivities(callback) {
	var self = this;

	var options = {
	    'query': {
		'page': 1,
		'per_page': 100
	    }
	};

	var rv = [];
	var finished = false;

	mod_vasync.whilst(function () {
		return (!finished);
	}, function (next) {
		self._get('athlete/activities', options, function (err, actvs) {
			if (err) {
				finished = true;
				next(err);
				return;
			}

			if (actvs.length < options.query.per_page) {
				finished = true;
			} else {
				options.query.page++;
			}

			rv = rv.concat(actvs.filter(function (a) {
				return (a.type === 'Ride');
			}));

			next();
		});
	}, function (err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, rv);
	});
};

Strava.prototype.getAthlete = function getAthlete(callback) {
    var self = this;
    self._get('athlete', callback);
};

module.exports = Strava;
