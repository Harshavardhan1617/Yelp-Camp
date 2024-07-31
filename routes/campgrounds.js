const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/Campgrounds");
const { isLoggedIn } = require("../middleware");
const campgroundsController = require("../controllers/campgrounds");

const { validateCampground, isAuthor } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgroundsController.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgroundsController.createCampground)
  );
// .post(upload.array("image"), (req, res) => {
//   res.send("it worked");
// });
router.get("/new", isLoggedIn, campgroundsController.newCampground);
router.get("/thejob", (req, res) => {
  res.send("hello");
});

router
  .route("/:id")
  .get(catchAsync(campgroundsController.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
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
