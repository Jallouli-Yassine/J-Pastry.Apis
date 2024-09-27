var express = require('express');
var router = express.Router();
const controller = require("../controller/AuthController");

/* Appel apis. */
 router.post("/register", controller.signupUser);
 router.post("/login", controller.login);
 router.post('/forgotPassword', controller.forgotPassword);
router.patch('/resetPassword/:token', controller.resetPassword);

module.exports = router;        

