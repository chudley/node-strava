var assert = require('assert');
var Strava = require('../.');
var format = require('util').format;

var token = '';

describe('Activities', function () {
    it('should list', function (done) {
        this.timeout(10000);
        var strava = new Strava({
            token: token
        });
        strava.listActivities(function (err, activities) {
            assert.equal(activities.length, 258);
            done();
        });
    });
    it('should 401', function (done) {
        var strava = new Strava({
            token: format('%s%s', token, 'xxx')
        });
        strava.listActivities(function (err, activities) {
            assert.equal(err.name, 'UnauthorizedError');
            done();
        });
    });
});

describe('Athlete', function () {
    it('should get', function (done) {
        var strava = new Strava({
            token: token
        });
        strava.getAthlete(function (err, athlete) {
            assert.equal(athlete.id, '370532');
            done();
        });
    });
    it('should 401', function (done) {
        var strava = new Strava({
            token: format('%s%s', token, 'xxx')
        });
        strava.getAthlete(function (err, athlete) {
            assert.equal(err.name, 'UnauthorizedError');
            done();
        });
    });
});
