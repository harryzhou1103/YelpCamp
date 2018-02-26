var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    passport   = require("passport"),
    flash      = require("connect-flash"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./data/campground"),
    Comment    = require("./data/comment"),
    User       = require("./data/user"),
    seedDB     = require("./seed"),
    session    = require("express-session");

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");


if(process.env.MLAB_USERNAME) { // check if running remotely
    var username = process.env.MLAB_USERNAME; // get from environment
    var password = process.env.MLAB_PASSWORD;
    connectionString = 'mongodb://' + username + ':' + password;
    connectionString += ' ​@ds247648.mlab.com:47648/heroku_q7lg24kj​';
    console.log(username + password)
    mongoose.connect(connectionString, function () {
        console.log("i have connected to mongodb")
    });// use yours
}
else {
    mongoose.connect("mongodb://localhost/yelp_camp_v10");
}
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
app.use(flash());

seedDB();

app.use(require("express-session")({
    secret: "This is the secret of the page!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT || 8080, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});