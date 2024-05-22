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
//for signin 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn, saveRedirectUrl,isOwner , isReviewAuthor} = require("./authenticate.js");

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
app.use(passport.initialize());//for sigin in
app.use(passport.session());//for sign in 
passport.use(new LocalStrategy(User.authenticate()));//for sigin in
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.faliur = req.flash("faliur");
    res.locals.user = req.user;
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

// app.get("/demouser" , async (req,res)=>{
//     let fakeUser = new User({
//         email : "abc@gmail.com",
//         username : "ABc",
//     })
//     let registeredUser = await User.register(fakeUser , "HelloWorld");
//     res.send(registeredUser);
// })

app.get("/signup" , (req,res)=>{
    res.render("./listings/signup.ejs");
})

app.post("/signup" ,async (req,res)=>{
    try {
        let {username ,email , password} = req.body;
        const newUser =  new User({username , email});
        const registeredUser =await User.register(newUser , password);
        req.login(registeredUser , (err)=>{
            if(err){
                return next()
            }
            req.flash("success" , "Welcome to WanderLust");
            res.redirect("/listings");
        })
        
    } catch (error) {
        req.flash("faliur" , error.message)
        res.redirect("/signup");
    }
})

app.get("/login" ,(req,res)=>{
    res.render("./listings/login.ejs");
})

app.get("/logout" , (req,res,next)=>{
    req.logout((err)=>{
        if(err){
           
            next(err)
        }
        req.flash("success" , "Logged Out");
        res.redirect("/listings");
    })
})

app.post("/login" ,saveRedirectUrl, passport.authenticate("local" ,{failureRedirect : "/login" ,failureFlash : true}),async(req ,res)=>{
    req.flash("success" , "Log in Successful");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
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

app.get("/listings/new" , isLoggedIn ,async(req,res)=>{
    res.render("./listings/new.ejs");
})

app.post("/listings",isLoggedIn, async(req,res ,next) =>{
    try {
        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success" , "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        next(error);
    }
})

app.get("/listings/:id/edit" ,isLoggedIn,isOwner, async(req ,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs" , {listing});
})

app.put("/listings/:id" ,isLoggedIn,isOwner, async(req,res,next)=>{
    try {
        let id = req.params.id;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }   
})

app.get("/listings/:id" , isLoggedIn,async (req,res)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id).populate({path : "review" , populate :{path : "author"}}).populate("owner");
    if(!listing){
        req.flash("faliur" , "NO SUCH PLACE");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs" , {listing})
})

app.post("/listings/:id/reviews" ,isLoggedIn,async (req,res)=>{
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
})

app.delete("/listings/:id" ,isLoggedIn, isOwner,async(req,res ,next)=>{
    try {
        let id = req.params.id;
        
        let listing = await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (error) {
        next(error)
    }
    
})

app.delete("/listings/:id/reviews/:revId" ,isLoggedIn, isReviewAuthor ,async (req,res)=>{
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
    console.log(`connected to port : ${port}`)
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