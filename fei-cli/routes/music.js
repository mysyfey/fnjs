var path=require('path'),
    mongodb = require('mongodb');

  var multipart = require("multiparty"),
  path=require('path'),
  mime = require("mime"),
  fs=require('fs'); 

module.exports = function (server, database) {
    //var multipartMiddleware = multiparty();
    //server.post('/upload', multipartMiddleware, function(req,res){
    function songList(callback){
      var collection = database.collection("songs.files");   
      collection.find().toArray(function(err,docs){
        var songs = new Array();
        for(var i in docs){
          songs[i] = {songName:docs[i].filename};
        }        
        callback(songs);
      }); 
    }

    server.get('/music', function(req,res){   
      songList(function(songs){
            res.render("music-sharing",{files:songs});
      });   
    });

    server.post('/music',  function(req,res){     
      var form = new multipart.Form({uploadDir:"upload"});

      form.parse(req, function(err, fields, files) {

        var filename = fields["name"] == "" ? files["file"][0].originalFilename : fields["name"][0], 
            p = files["music"][0].path;
        var bucket = new mongodb.GridFSBucket(database,{bucketName:"songs"});

        var readStream = fs.createReadStream(path.join(__dirname,p));
        var writeStream = bucket.openUploadStream(filename);
        
        readStream.pipe(writeStream).on('error', function(error) {
          console.log(error);
          res.writeHead(200, {'Content-Type' : 'text/plain'}); 
          res.end("error");
        }).on("finish",function(result){   
          
          console.log(result);
          songList(function(songs){
            res.render("music-sharing",{files:songs});
          });          
          

          /*var collection = database.collection("music");

          collection.insertOne({
            "name": result.filename,
            "fId":result._id}).then(function(resu){
            if(resu){
              collection.find().toArray(function(err,docs){
                res.render("music-sharing",{files:docs});
              });
              //res.render("music-sharing",{files:docs});
            }
          });*/
        });
      });
    });

    server.get('/music/file', function(req,res){

      res.writeHead(200,{"Content-Type":" audio/mp3"});
      var musicName = req.query.music;
      var bucket = new mongodb.GridFSBucket(database,{bucketName:"songs"});
      var readable = bucket.openDownloadStreamByName(musicName);
      console.log(musicName);

      readable.pipe(res).on('error', function(error) {
        console.log(error);
      });

      
      /*readable = fs.createReadStream(file),
        m = mime.lookup(file);
        res.writeHead(200, {'Content-type' : m});
        readable.pipe(res);*/

        /*res.on("drain",()=>{
            //console.log("drain");
            readable.resume();
          });
        readable.on('data', (chunk) => {
          var result = res.write(chunk);
          //console.log(`Received ${chunk.length} bytes of data.`);
          //console.log("result");
          if(!result) {
            readable.pause();
          }
        });
        readable.once('end', () => {
          console.log('download completed');
          res.end();
      });*/            
    });

};