module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("faliur" , "Log in first");
        return res.redirect("/login");
    }
    next();
}
