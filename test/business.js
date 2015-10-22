var app = require('../app');
var assert = require('assert');
const Browser = require('zombie');
var http = require('http');
var requestPromise = require('request-promise');
app.set('port', 3000);

describe('server', function () {
  describe('Server status', function () {
    before(function() {
      this.server = http.createServer(app).listen(3000);
    });

    it('should show response 200 when accessing home page', function (done) {
      http.get('http://localhost:3000', function (response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should show response 200 when accessing business/id/upload', function (done) {
      http.get('http://localhost:3000/business/id/upload', function (response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    // Timesout when left uncommented
    // after(function (done) {
    //   this.server.close(done);
    // });
  });
});

describe('business/id/upload home page', function () {
  // before(function() {
  //   this.server = http.createServer(app).listen(3000);
  //   const browser = new Browser();
  // });

  // // load the business upload page
  // before(function (done) {
  //   browser.visit('/business/id/upload', done);
  // });

  // it('should display textarea for pasting', function() {
  //   assert.ok(this.browser.success);
  //   assert.equal(this.browser.text('h1'), 'Contact');
  // });

  it('should display an empty textarea');
  it('should display a review button');
  it('should display an inactive review step icon');
  it('should display an inactive upload step icon');
});

describe('business/id/upload review page', function () {
  it('should display highlighted paste step icon');
  it('should display highlighted review step icon');

  it('should display how many contacts were scanned');
  it('should allow backtrack link to through paste step icon');

  it('should display an alert with how many emails/names it found');
  it('should display an alert when pasted csv does not have a header');
  it('should display an alert when names are missing');
  it('should display an alert when emails are missing');

  it('should not display upload button if there are no emails');

  it('should show the upload page when user clicks the upload button');
});

describe('business/id/upload final page', function () {
  it('should display an upload more button');
  it('should display have all the 3 steps (paste, review, upload) highlighted');

  it('should display a status message from clicking upload on review page');
});
