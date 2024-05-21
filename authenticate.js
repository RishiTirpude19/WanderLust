module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("faliur" , "You must Log in first");
        return res.redirect("/login");
    }
    next();
}
