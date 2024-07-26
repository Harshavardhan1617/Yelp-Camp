const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const Review = require("../models/reviews");
const { validateReview, isAuthor, isLoggedIn } = require("../middleware");
const reviewController = require("../controllers/reviews");

router.post(
  "/",
  validateReview,
  isLoggedIn,
  catchAsync(reviewController.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  catchAsync(reviewController.deleteReview)
);

module.exports = router;
