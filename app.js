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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.send("<h1>Hello<h1>");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds })
});

app.get("/campgrounds/:id", async (req, res) => {
  const showCamp = await Campground.findById(req.params.id)
  res.render("campgrounds/show", {showCamp})
})

app.listen(3000, () => {
  console.log("serving on port 3000!!");
});
