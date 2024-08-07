if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoSanitize = require("express-mongo-sanitize");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const helmet = require("helmet");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const MongoStore = require("connect-mongo");

const { startKeepAlive, getLogs } = require("./alive");

const db_url = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(db_url);
// mongoose.connect(db_url);

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
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/db1byxn8j/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

const secret = process.env.SECRET || "mysecret";

const store = MongoStore.create({
  mongoUrl: db_url,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR: ", e);
});

const sessionConfig = {
  store,
  name: "_jksdfh",
  secret,
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/logs", async (req, res) => {
  try {
    const logs = await getLogs();
    res.send(logs.join("\n"));
  } catch (error) {
    res.status(500).send("Error retrieving logs");
  }
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
  const serverUrl = "https://yelp-camp-hnqs.onrender.com/campgrounds/thejob";
  startKeepAlive(serverUrl).catch((error) => {
    console.error("Error starting keep-alive process:", error);
  });
});
