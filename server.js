// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
// var methodOverride = require("method-override"); 
var logger = require("morgan");
var mongoose = require("mongoose");

// var path = require("path"); 

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
// app.use(methodOverride("_method"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes

// var routes = require("./controllers/controller.js");

// app.use("/", routes); 


  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.nytimes.com/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function(i, element) {

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("h2").children("a").text();
        result.link = $(this).children("h2").children("a").attr("href");
        result.summary = $(this).children("p.summary").text(); 
        result.saved = false; 

        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        }); //entry 

      }); //article h2 

    }); //request 
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
    alert("Articles Added!"); 
  }); //scrape 

  app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });

  // Grab an article by it's ObjectId
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    // now, execute our query
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });


  // Create a new note or replace an existing note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newComment = new Comment(req.body);

    // And save the new note the db
    newComment.save(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise
      else {
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": doc._id }}, { new: true })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            // Or send the document to the browser
            res.send(doc);
          }
        });
      }
    });
  });

  app.post("/articles/save/:id", function(req, res){

  	req.body.title = $(this).title;
  	req.body.link = $(this).link;
  	req.body.summary = $(this).summary; 
  	req.body.saved = true;

  	var newSave = new Article(req.body); 

  	newSave.save(function(err, doc) {
  		if (err) {
  			res.send(err);
  		}
  		else {
  			res.send(doc); 
  		}
  	}) //end newSave

  }); //end save

  app.post("/articles/removeSave/:id", function(req, res){

  	req.body.title = $(this).title;
  	req.body.link = $(this).link;
  	req.body.summary = $(this).summary; 
  	req.body.saved = false;

  	var newRemove = new Article(req.body); 

  	newRemove.save(function(err, doc) {
  		if (err) {
  			res.send(err);
  		}
  		else {
  			res.send(doc); 
  		}
  	}) //end newSave

  }); //end removeSave

  app.get("/articles/remove/:id", function(req, res) {
    Article.remove({"_id": req.params.id}, function(err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/"); 
      }
    });
  });

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port " + port);
});

/*
    mongodb://heroku_wplqh1pz:m64i2s9ukb3b10a1uh15ipks4r@ds163612.mlab.com:63612/heroku_wplqh1pz
*/

