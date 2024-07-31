const { places, descriptors } = require("./seedHelpers");
const cities = require("./cities");

const mongoose = require("mongoose");
const Campground = require("../models/Campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", (err) => logError(err));
db.once("open", () => {
  console.log("Database Connected!!");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random100 = Math.floor(Math.random() * 100);

    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/db1byxn8j/image/upload/v1722397592/qingbao-meng-01_igFr7hd4-unsplash_1_nbyaxz.jpg",
          filename: "qingbao-meng-01_igFr7hd4-unsplash_1_nbyaxz",
        },
        {
          url: "https://res.cloudinary.com/db1byxn8j/image/upload/v1722397586/bailey-zindel-NRQV-hBF10M-unsplash_1_yy3ie4.jpg",
          filename: "bailey-zindel-NRQV-hBF10M-unsplash_1_yy3ie4",
        },
        {
          url: "https://res.cloudinary.com/db1byxn8j/image/upload/v1722397573/johannes-plenio-RwHv7LgeC7s-unsplash_1_lxco82.jpg",
          filename: "johannes-plenio-RwHv7LgeC7s-unsplash_1_lxco82",
        },
      ],
      price: random100,
      author: "669e170fd7902e048c91c481",
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto vero deserunt officiis et corporis nobis quo ad, nemo at facilis laudantium alias aut incidunt exercitationem natus, animi cum dolorem? Sed a saepe expedita, molestiae ipsa dolores incidunt neque reiciendis.",
    });
    await camp.save();
  }
  console.log("saved");
  mongoose.connection.close();
};

seedDb();
