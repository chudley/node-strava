var mod_assertplus = require('assert-plus');
var mod_fs = require('fs');

var config = JSON.parse(mod_fs.readFileSync('./etc/config.json'));

var Strava = require('../lib/strava');

var strava = new Strava({
    token: config.strava.token
});

describe('Strava', function () {
	it('getAthlete', function (done) {
		strava.getAthlete(function (err, athlete) {
			mod_assertplus.equal(athlete.id, '5691478');
			done();
		});
	});
	it('listAthleteActivities', function (done) {
		this.timeout(10000);
		strava.listAthleteActivities(function (err, activities) {
			mod_assertplus.equal(activities.length, 3);
			done();
		});
	});
	it('getActivity', function (done) {
		strava.getActivity(1616481871, function (err, activity) {
			mod_assertplus.equal(activity.name, 'Lunch Ride');
			mod_assertplus.arrayOfObject(activity.segment_efforts);
			done();
		});
	});
	it('Unauthorised', function (done) {
		var s = new Strava({
		    token: 'fail'
		});
		s.getAthlete(function (err, athlete) {
			mod_assertplus.equal(err.name, 'UnauthorizedError');
			done();
		});
	});
});
