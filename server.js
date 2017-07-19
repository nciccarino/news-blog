// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var path = require("path"); 

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
var PORT = process.env.PORT || 3000; 

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsBlog");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes

require("./routes/api-routes.js")(app);
require("./routes/html-routes.js")(app);
require("./routes/scrape-routes.js")(app);

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});

/*
    mongodb://heroku_wplqh1pz:m64i2s9ukb3b10a1uh15ipks4r@ds163612.mlab.com:63612/heroku_wplqh1pz
*/

