const Listing = require("./models/listings");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.origianlUrl;
        req.flash("faliur" , "You must Log in first");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let id = req.params.id;
    let newListing = await Listing.findById(id);
        if(!newListing.owner._id.equals(req.locals.user._id)){
            req.flash("faliur" , "Cant Delete This");
            return res.redirect(`/listings/${id}`);
        }
        next();
}

module.exports.isReviewAuthor =async (req,res,next)=>{
    let {id , revId} = req.params;
    let review = await Review.findById(revId);
    if(!review.author._id.equals(req.locals.user_id)){
        req.flash("faliur" , "Cant Delete This");
        return res.redirect(`/listings/${id}`);
    }
    next();
}