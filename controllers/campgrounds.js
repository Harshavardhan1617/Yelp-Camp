const Campground = require("../models/Campgrounds");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.newCampground = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  console.log(campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "successfull created a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const showCamp = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");

  if (!showCamp) {
    req.flash("error", "Cannot Find the Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { showCamp });
};

module.exports.editCampground = async (req, res) => {
  const findCamp = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { findCamp });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.files);
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgArr = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.images.push(...imgArr);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "successfully updated campgrounds!");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campground");
  res.redirect("/campgrounds/");
};
