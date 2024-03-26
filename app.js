const express = require("express");
const path = require("path");
const mongoose = require("mongoose"); 
const Campground = require("./models/Campgrounds");


mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected!!")
});

const app = express();

app.use(express.urlencoded({extended: true}))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.send("<h1>Hello<h1>");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds })
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
}) 

app.post("/campgrounds", async(req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)
})

app.get("/campgrounds/:id", async (req, res) => {
  const showCamp = await Campground.findById(req.params.id)
  res.render("campgrounds/show", {showCamp})
})

app.get("/campgrounds/:id/edit", async (req, res) => {
  const findCamp = await Campground.findById(req.params.id)
  res.render("campgrounds/edit")
} )

app.listen(3000, () => {
  console.log("serving on port 3000!!");
});
