// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();
var port = process.env.PORT || 8080; 

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsBlog", { useMongoClient: true });
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//handlebars stuff

var exphbs = require("express-handlebars");

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.redirect("/articles")
});

app.get("/saved", function(req, res) {
  res.redirect("/articles/save/:id"); 
}); 
// Routes

var routes = require("./controllers/controller.js");

app.use("/", routes); 

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port " + port);
});

/*
    mongodb://heroku_wplqh1pz:m64i2s9ukb3b10a1uh15ipks4r@ds163612.mlab.com:63612/heroku_wplqh1pz
*/

