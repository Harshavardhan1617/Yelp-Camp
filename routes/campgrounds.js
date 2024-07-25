const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const { isLoggedIn } = require("../middleware");

const { validateCampground, isAuthor } = require("../middleware");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  validateCampground,
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "successfull created a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const showCamp = await Campground.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");

    if (!showCamp) {
      req.flash("error", "Cannot Find the Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { showCamp });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const findCamp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { findCamp });
  })
);

router.put(
  "/:id/",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "successfully updated campgrounds!");
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

router.delete(
  "/:id/",
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully Deleted Campground");
    res.redirect("/campgrounds/");
  })
);

module.exports = router;
