var express = require('express');
var requestPromise = require('request-promise');
// TODO: Figure out how to register helpers...
var hbs = require('hbs');

var router = express.Router();

/*
GET csv uploader.
Renders page where user can paste in their raw CSV.
*/
router.get('/:id/upload', function (req, res, next) {
  var businessID = req.params.id;
  var renderVars = {
    'businessID': businessID,
    'pageTitle': 'CSV Uploader',
    'showUploadPage': false
  };
  res.render('business/upload', renderVars);
});

/*
POST csv uploader.
Request from the csv uploader form.
*/
router.post('/:id/upload', function (req, res, next) {
  var businessID = req.params.id;
  var contacts = req.body.contacts;
  console.log('/' + businessID + '/upload: Received contacts:\n' + contacts);

  var postBody = {
    'businessID': businessID,
    'customers': contacts
  };
  var options = {
    method: 'POST',
    // Replace me with your non-expired requestbin URI :)
    uri: 'http://requestb.in/oeuzjfoe',
    body: postBody,
    json: true // Automatically stringifies the body to JSON
  };
  var renderVars = {
    'businessID': businessID,
    'pageTitle': 'CSV Uploader',
    'showUploadPage': true
  }

  requestPromise(options)
    .then(function (parsedBody) {
      console.log('/' + businessID + '/upload: Successfully posted! ' + JSON.stringify(parsedBody));

      renderVars.uploadStatus = 'Successfully uploaded!';
      res.render('business/upload', renderVars);
    })
    .catch(function (err) {
      console.log('/' + businessID + '/upload: Failed to upload to server: ' + JSON.stringify(err));

      renderVars.uploadStatus = 'Error: ' + JSON.stringify(err);
      res.render('business/upload', renderVars);
    });
});

// function registerHelpers () {
//   hbs.registerHelper('helper_name', function(...) { ... });
// }

module.exports = router;
