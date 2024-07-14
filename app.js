
if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
    
const express = require("express");
const app = express();
const mongoose = require('mongoose');
//const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERLUST2"
const MONGO_URL =process.env.MONGODB_URL;
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn, saveRedirectUrl,isOwner , isReviewAuthor} = require("./authenticate.js");
const listingController = require("./controllers/listing.js");
const reviewController = require("./controllers/review.js");
const userCOntroller = require("./controllers/user.js");
const {storage } = require("./cloudConfig.js")
const multer  = require('multer')
const upload = multer({ storage})

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
app.get("/signup" , userCOntroller.renderSignUp);
app.post("/signup" , userCOntroller.signUp)
app.get("/login" ,userCOntroller.renderLoginForm)
app.get("/logout" ,userCOntroller.logOut);
app.post("/login" ,saveRedirectUrl, passport.authenticate("local" ,{failureRedirect : "/login" ,failureFlash : true}),userCOntroller.login);
app.get("/listings" , listingController.index);
app.get("/listings/new" , isLoggedIn ,listingController.renderNewForm);
app.post("/listings",isLoggedIn, upload.single("listing[image]"), listingController.addNewListing);
app.get("/listings/:id/edit" ,isLoggedIn,isOwner, listingController.editListing);
app.put("/listings/:id" ,isLoggedIn,isOwner,upload.single("listing[image]"), listingController.updateListing);
app.get("/listings/:id" , isLoggedIn,listingController.showListing);
app.post("/listings/:id/reviews" ,isLoggedIn,reviewController.createReview);
app.delete("/listings/:id" ,isLoggedIn, isOwner,listingController.deleteListing);
app.delete("/listings/:id/reviews/:revId" ,isLoggedIn, isReviewAuthor ,reviewController.destroyReview);
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
app.use((err , req ,res ,next)=>{
    let {status = 500 , message = "Something went wrong"} = err;
    res.status(status).render("./listings/error.ejs" , {message});
})