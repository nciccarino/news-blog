var express = require("express"); 
var request = require("request");
var cheerio = require("cheerio"); 

var router = express.Router(); 

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

  router.get("/scrape", function(req, res) {
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
    res.redirect("/articles");
  }); //scrape 

  router.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {

        var obj = { articles: doc };

        res.render("index", obj);
      }
    });
  });

  // Grab an article by it's ObjectId
  router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id }, function(error, doc) {
      if (error) {
        console.log(error); 
      }
      else {
        var obj = { comments: doc };

        res.render("saved-articles", obj); 
      }
    }); 

  });

  // // Grab an article by it's ObjectId
  // router.get("/articles/:id", function(req, res) {
  //   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  //   Article.findOne({ "_id": req.params.id })
  //   // ..and populate all of the notes associated with it
  //   .populate("comment")
  //   // now, execute our query
  //   .exec(function(error, doc) {
  //     // Log any errors
  //     if (error) {
  //       console.log(error);
  //     }
  //     // Otherwise, send the doc to the browser as a json object
  //     else {
  //       res.json(doc);
  //     }
  //   });
  // });

  // Create a new note or replace an existing note
  router.post("/articles/:id", function(req, res) {
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

            var id = newComment.id 

            res.redirect("/saved"); 
          }
        });
      }
    });
  });

  router.post("/articles/save/:id", function(req, res){
    console.log('articles/save/:id POST')
    Article.findOneAndUpdate({ "_id": req.params.id }, {$set: {saved:true}}, (function(err, doc) {
      if (err) {
        res.send(err);
      }
      else {
        Article.find({}, function(error, doc) {
      // Log any errors
          if (error) {
            console.log(error);
          }
          // Or send the doc to the browser as a json object
          else {

            var obj = { articles: doc };
            console.log('========== POST articles/save/id ==========')
            console.log(obj)

            res.render("saved-articles", obj);
          }
        });
      }
    })) //end newSave

  }); //end save

  router.get("/articles/save/:id", function(req, res) {
    console.log('articles/save/:id GET')
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {

        var obj = { articles: doc };
        console.log('===================')
        console.log(obj); 

        res.render("saved-articles", obj);
      }
    });
  });

  router.post("/articles/removeSave/:id", function(req, res){

    Article.findOneAndUpdate({ "_id": req.params.id }, {$set: {saved:false}}, (function(err, doc) {
      if (err) {
        res.send(err);
      }
      else {
        Article.find({}, function(error, doc) {
      // Log any errors
          if (error) {
            console.log(error);
          }
          // Or send the doc to the browser as a json object
          else {

            var obj = { articles: doc };

            // res.redirect('/')

            res.render("index", obj);
          }
        });
      }
    })) //end newSave

  }); //end removeSave

  router.get("/articles/remove/:id", function(req, res) {
    Article.remove({"_id": req.params.id}, function(err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/"); 
      }
    });
  });

  module.exports = router; 