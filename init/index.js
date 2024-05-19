const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERLUST2"
const Listing = require("../models/listings");
const initialData = require("./data");

async function initDb(){
    await Listing.deleteMany({});
    await Listing.insertMany(initialData.data);
    console.log("Data Was Saved");
}

initDb();

main().then(()=>{
    console.log("DB connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}