var express = require('express');
var router = express.Router();
const controller = require("../controller/AuthController");

/* Appel apis. */
 router.post("/register", controller.signupUser);
 router.post("/login", controller.login);

module.exports = router;

