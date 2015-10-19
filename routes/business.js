var express = require('express');
var router = express.Router();

/* GET csv uploader. */
router.get('/:id/upload', function(req, res, next) {
  var businessID = req.params.id;
  var renderVars = {
    'businessID': businessID,
    'title': 'TEST 123'
  };
  res.render('business/index', renderVars);
});

module.exports = router;
