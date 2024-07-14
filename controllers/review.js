const Listing = require("../models/listings");
const Review = require("../models/review");

module.exports.createReview = async (req,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();
    listing.review.push(newReview);
    await listing.save();
    console.log(listing);
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async (req,res)=>{
    let {id , revId} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    await Listing.findByIdAndUpdate(id , {$pull: {review: revId}});
    await Review.findByIdAndDelete(revId);
    res.redirect(`/listings/${id}`);
}