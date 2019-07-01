var path=require('path'),
    mongodb = require('mongodb');

var multipart = require("multiparty"),
mime = require("mime"),
path=require('path'),
fs=require('fs');

console.log(arguments);
module.exports = function (server, database,baseDir) {

    function fileList(callback){
      var collection = database.collection("archive.files"); 
      
      var cursor = collection.find({},{projection:{'filename':1,'metadata':1}});
      var files = new Array();

      var getDocs = function(){
        cursor.hasNext().then(function(){
            return cursor.next();
        }).then((data)=>{
          var file = {"fileName":data.filename};
          for(var a in data.metadata)
            file[a] = data.metadata[a];
          files.push(file);
          
          getDocs();

        },function(){

          console.log("get all" + files.length + "files");
          callback(files);

        }); 
      }; 

      getDocs();


       /*.toArray(function(err,docs){
        if(err){
          console.log(err);
          return null;
        }
          console.log(docs);
        var files = new Array();
        for(var i in docs){
          files[i] = {fileName:docs[i].filename};
          var file = files[i], meda = docs[i].metadata;
          for(var a in meda)
            file[a] = meda[a];
        }      
        callback(files);
      }); */
    }

    server.get('/fileshare', function(req,res){   
        fileList(function(files){
            res.render("fileshare",{"files":files});
        });        
    });

    server.post('/file',  function(req,res){ 
         
      var form = new multipart.Form({uploadDir:"upload"});

      form.parse(req, function(err, fields, files) {

        var file = files["file"][0],
        filename =fields["name"] == "" ? file.originalFilename : fields["name"][0], 
        d = fields["description"] ? fields["description"][0] : "";

        var bucket = new mongodb.GridFSBucket(database,{bucketName:"archive"});

        var readStream = fs.createReadStream(path.join(baseDir,file.path));
        var writeStream = bucket.openUploadStream(filename,
          {contentType:file.headers["content-type"],
          metadata:{description:d,originalName:file.originalFilename}});
        
        readStream.pipe(writeStream).on('error', function(error) {
          console.log(error);
          res.writeHead(200, {'Content-Type' : 'text/plain'}); 
          res.end("error");
        }).on("finish",function(result){   
          
          fileList(function(files){
            res.render("fileshare",{"files":files});
          });          
          
        });
      });
    });

    server.get('/file/:fileId', function(req,res){

      var fileName = req.params.fileId;
      var collection = database.collection("archive.files"); 

      collection.findOne({"filename":fileName}, function(err, docs){

        var original = docs.metadata.originalName
        var type = mime.lookup(original);

        var bucket = new mongodb.GridFSBucket(database,{bucketName:"archive"});
        var readable = bucket.openDownloadStreamByName(fileName);

        res.writeHead(200,{"Content-Type": type});
        readable.pipe(res).on('error', function(error) {
          console.log(error);
        });

      });
    });

};