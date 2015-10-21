var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function (req, res, next) {
  var renderVars = { title: 'Test Title' };
  res.render('index', renderVars);
});

module.exports = router;
