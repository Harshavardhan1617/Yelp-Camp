const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const path = require("path");
const mongoose = require("mongoose");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected!!");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionConfig = {
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.messege) err.messege = "Oh Noo!! Something Went Wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("serving on port 3000!!");
});
