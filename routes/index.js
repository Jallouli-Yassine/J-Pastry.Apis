var express = require('express');
var router = express.Router();
const controller = require("../controller/Controller");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Appel apis. */
//exmple : router.post("/blabla", controller.addJoueur);

module.exports = router;
