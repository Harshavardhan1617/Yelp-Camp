const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const { isLoggedIn } = require("../middleware");
const campgroundsController = require("../controllers/campgrounds");

const { validateCampground, isAuthor } = require("../middleware");

router
  .route("/")
  .get(catchAsync(campgroundsController.index))
  .post(
    validateCampground,
    isLoggedIn,
    catchAsync(campgroundsController.createCampground)
  );
router.get("/new", isLoggedIn, campgroundsController.newCampground);

router
  .route("/:id")
  .get(catchAsync(campgroundsController.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgroundsController.updateCampground)
  )
  .delete(isAuthor, catchAsync(campgroundsController.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsController.editCampground)
);

module.exports = router;
