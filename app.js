const express = require("express");
const app = express();
const mongoose = require('mongoose');
const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERLUST2"
const port = 8080;
const Listing = require("./models/listings");
const path = require("path");
const { url } = require("inspector");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");

const sessionOptions = {
    secret : "SuperSecretMsg",
    resave : false ,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.faliur = req.flash("faliur");
    next();
})

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"))// use to connect main view engine as views folder 
app.use(express.urlencoded({extended : true}));// use to parse object id from api routes
app.use(methodOverride("_method")); // put and patch request handeler
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , "/public")));
app.engine("ejs" , ejsMate);
app.get("/",(req,res)=>{
    res.json("root")
})

// app.get("/testSchema" , (req,res)=>{
//     let sampleListing = new Listing({
//         title : "My new Villa",
//         description : "Very nice place to spend Winters",
//         location : "shillong, Assam",
//         price : 1200,
//         country : "INDIA",
//     })

//     sampleListing.save().then((result)=>{
//         console.log(result);
//     }).catch((err)=>{
//         console.log(err);
//     })

//     res.json("Saved");
// })

app.get("/listings" ,async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("./listings/listings.ejs" , {allListings})
})

app.get("/listings/new" ,async(req,res)=>{
    res.render("./listings/new.ejs");
})

app.post("/listings", async(req,res ,next) =>{
    try {
        let newListing = new Listing(req.body.listing);
        console.log(newListing);
        await newListing.save();

        req.flash("success" , "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        next(error);
    }
})

app.get("/listings/:id/edit" , async(req ,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs" , {listing});
})

app.put("/listings/:id" , async(req,res,next)=>{
    try {
        let id = req.params.id;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }   
})

app.get("/listings/:id" ,async (req,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id).populate("review");
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs" , {listing})
})

app.post("/listings/:id/reviews" ,async (req,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    let newReview = new Review(req.body.review);
    await newReview.save();
    listing.review.push(newReview);
    await listing.save();
    console.log(listing);
    res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id" , async(req,res ,next)=>{
    try {
        let id = req.params.id;
        let listing = await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (error) {
        next(error)
    }
    
})

app.delete("/listings/:id/reviews/:revId" ,async (req,res)=>{
    let {id , revId} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    await Listing.findByIdAndUpdate(id , {$pull: {review: revId}});
    await Review.findByIdAndDelete(revId);
    res.redirect(`/listings/${id}`);
})

app.listen(port , ()=>{
    console.log(`Listing to port : ${port}`)
})

main().then(()=>{
    console.log("DB connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// app.get("/testing/new" ,(req,res)=>{
//     res.render("./listings/test.ejs");
// })

// app.post("/testing" , (req,res)=>{
//     let data = req.body;
//     console.log(data);
//     res.redirect("/");
// })

app.use((err , req ,res ,next)=>{
    let {status = 500 , message = "Something went wrong"} = err;
    res.status(status).render("./listings/error.ejs" , {message});
})