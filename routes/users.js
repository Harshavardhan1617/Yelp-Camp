const express = require("express");
const User = require("../models/user");
const router = express.Router();
const localStrategy = require("passport-local");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const userController = require("../controllers/users");

router.get("/register", userController.getRegisterForm);
router.post("/register", catchAsync(userController.createUser));
router.get("/login", userController.getLoginForm);
router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  userController.login
);
router.get("/logout", userController.logout);

module.exports = router;
