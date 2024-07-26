const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const { isLoggedIn } = require("../middleware");
const campgroundsController = require("../controllers/campgrounds");

const { validateCampground, isAuthor } = require("../middleware");

router.get("/", catchAsync(campgroundsController.index));
router.get("/new", isLoggedIn, campgroundsController.newCampground);
router.post(
  "/",
  validateCampground,
  isLoggedIn,
  catchAsync(campgroundsController.createCampground)
);
router.get("/:id", catchAsync(campgroundsController.showCampground));
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsController.editCampground)
);
router.put(
  "/:id/",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgroundsController.updateCampground)
);
router.delete(
  "/:id/",
  isAuthor,
  catchAsync(campgroundsController.deleteCampground)
);

module.exports = router;
