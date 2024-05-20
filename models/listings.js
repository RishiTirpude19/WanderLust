const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type :String,
        require : true,
        },
    description : String,
    image : {
        type : String,
        // default : "https://cdn4.iconfinder.com/data/icons/standard-free-icons/139/Home01-512.png",
        // set: (v) => v.trim == "" ? "https://cdn4.iconfinder.com/data/icons/standard-free-icons/139/Home01-512.png" : v,
    },
    location : String,
    price : Number,
    country : String,
    review : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    
    ]       
})

listingSchema.post("findOneAndDelete" , async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.review}});
    }
})

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;