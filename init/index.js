const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERLUST2";
const Listing = require("../models/listings");
const initialData = require("./data").data; // Importing the sample data

async function main() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected");

    // Initialize the database with the sample data
    await initDb();
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    // Ensure the database connection is closed after operations are completed
    mongoose.connection.close();
  }
}

async function initDb() {
  try {
    // Delete all existing documents in the Listing collection
    await Listing.deleteMany({});
    console.log("Existing listings deleted");

    // Map over the sample data to add the owner property
    const updatedData = initialData.map((obj) => ({
      ...obj,
      owner: '664edfeb9fe5b914a46e4e8b',
    }));
    
    // Insert the updated sample data into the Listing collection
    await Listing.insertMany(updatedData);
    console.log("Data was saved");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

// Run the main function to start the process
main();
