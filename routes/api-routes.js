var path = require("path"); 
var request = require("request");
var cheerio = require("cheerio"); 

var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

module.exports = function(app) {

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
        Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": doc._id }}, { new: true })
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

  app.get("/comments/:id", function(req, res) {
    Comment.remove({"_id": req.params.id}, function(err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/"); 
      }
    })
  })

}// module.exports