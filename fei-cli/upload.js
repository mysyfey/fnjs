
var http = require("http"),
    express=require('express'),
    fs=require('fs'),
    path=require('path'),
    fsThen =require("./utils/fspromise.js"),
    staticServer = require("./middlewares/fstatic-server"),
    utils = require("./utils/utils.js"),
    mime = require("mime"),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    multiparty = require("connect-multiparty"),
    multipart = require("multiparty"),util = require('util');

  var musicRoute = require("./routes/music"),
    fileShareRoute = require("./routes/fileshare");


var mongoClient, database;

MongoClient.connect("mongodb://localhost:27017",
                    { useNewUrlParser: true }, function(err,client) {
  if(!err){

  var mongoClient = client; 
  var database = mongoClient.db("feiBlog"); 

    /*var collection = database.collection("archive.files"); 

      var files = new Array();
      var cursor = collection.find();      

      var getDocs = function(f){
        cursor.hasNext().then(function(){
            return cursor.next();
        }).then((data)=>{
          files.push(data)
          getDocs();
        },function(){
          console.log("complete!");
        }); 
      };

      getDocs(files);*/

 
      


    var server = new express();
    server.set('views', __dirname + '/public/views');
    server.set('view engine', 'ejs');
    //server.use(staticServer(path.join(__dirname, "public")));

    musicRoute(server,database);
    fileShareRoute(server,database,__dirname);

    //var multipartMiddleware = multiparty();
    //server.post('/upload', multipartMiddleware, function(req,res){


    http.createServer(server).listen(80, function () {
      console.log("Express server listening on port " + 80);
    });
  } else 
    console.log(err);
});
