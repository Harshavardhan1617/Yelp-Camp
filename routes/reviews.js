const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const Review = require("../models/reviews");
const { validateReview, isAuthor, isLoggedIn } = require("../middleware");

router.post(
  "/",
  validateReview,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash("success", "Created New Review");
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully Deleted Review");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
