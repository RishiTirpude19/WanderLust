const Listing = require("../models/listings");

module.exports.index = async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("./listings/listings.ejs" , {allListings})
}

module.exports.renderNewForm = async(req,res)=>{
    res.render("./listings/new.ejs");
}

module.exports.addNewListing = async(req,res ,next) =>{
    try {
        const { path: url, filename } = req.file;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        await newListing.save();
        req.flash('success', 'New Listing Created!');
        res.redirect('/listings');
    } catch (error) {
        next(error);
    }
}

module.exports.editListing = async(req ,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs" , {listing});
}

module.exports.updateListing = async(req,res,next)=>{
    try {
        let id = req.params.id;
        let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
        if(typeof req.file !== "undefined"){
            let {url , filename} = req.file;
            let newListing = new Listing(req.body.listing);
            listing.image = {url , filename};
            await listing.save();
        }
        req.flash("success" , "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }   
}

module.exports.showListing = async (req,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id).populate({path : "review" , populate :{path : "author"}}).populate("owner");
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs" , {listing})
}

module.exports.deleteListing = async(req,res ,next)=>{
    try {
        let id = req.params.id;
        let listing = await Listing.findByIdAndDelete(id);
        req.flash("success" , "Listing Deleted !!")
        res.redirect("/listings");
    } catch (error) {
        next(error)
    }
}