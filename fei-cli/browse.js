
var http = require('http'),
    myHttp = require("./utils/myhttpserver"),
    express=require('express'),
    fs=require('fs'),
    path=require('path'),
    config=require('./default'),
    mime=require('mime'),
    staticServer = require("./middlewares/fstatic-server"),
    fsThen =require("./utils/fspromise.js"),
    utils = require("./utils/utils.js"),
    jschardet=require('jschardet'),
    icon=require('iconv-lite');

module.exports = function (args) {
var port = args[0] ? args[0] : 80;
console.log("browse port",  port)
var server = new myHttp();
//server.set('views', __dirname + '/public/views');
//server.set('view engine', 'ejs');
server.use(staticServer(path.join(__dirname, "public")));
server.views = path.join(__dirname, "public/views");

const ARCHIVES_BROWSER = "ARBR"
server.use(function(req,res,next){

  var ind = req.url.indexOf(ARCHIVES_BROWSER)

  if(ind == 1) {
    var url = req.url.substr(req.url.indexOf(ARCHIVES_BROWSER) + ARCHIVES_BROWSER.length);    

    if(url == "/"){

      var folders = [];

      for(var i in config.Archives){
        folders.push({name:i,type:"folder"});
      }

      var vData = {navDir : [{name:"主页",link:"/"}],
            folder: folders, 
            baseDir: "/"};

      fsThen.readFile(path.join(server.views,"folder.ejs"),{encoding:"utf8"})
              .then(function(html){
            res.send({template:html, data:vData});
        });
    
    } else {    

      var splits = url.split("/");
      var rf = splits[1];
      rootFolder = config.Archives[rf];

      if(rootFolder){
        var directory = rootFolder;
        for (var i = 2; i < splits.length; i++) {
          directory = path.join(directory,splits[i])
        }
        getFileOrFolder(res,url,req.query.type,directory);
      }
      else
        next();

    }
  } else next();

});

function getNavData(url){
  var splits = url.split("/"), u="/" , nav = new Array({name:"主页",link:u});
  for (var i = 1; i < splits.length; i++) {       
    u += splits[i] + "/";
    nav.push(i < (splits.length - 1) ? {name:splits[i],link:u} : {name:splits[i]}) ;
  }
  return nav;
}

function getFileOrFolder(res,url,type,directory){

  console.log("browser url : ",url, " dir: ",directory, type);

  fsThen.exists(directory).then(function (exists) {

    if(type == "folder") {
      
      fsThen.readdir(directory,{"withFileTypes":true, "encoding":"utf8"})
      .then(function(dirents){

        var dirs = [];

        for (var i = 0; i < dirents.length; i++) {
          var fType = "unpreviewable";
          if(dirents[i].isFile()){

            var type = mime.lookup(dirents[i].name);            
           
            if(type.indexOf("text") >= 0 
              || (type.indexOf("image") < 0 
              && type.indexOf("video") < 0
              && type.indexOf("audio") < 0
              && type.indexOf("application/zip") < 0))
              fType = "preview"
          }
          else
            fType = "folder"

          dirs.push({name:dirents[i].name,type:fType});
        }

        var vData = {navDir : getNavData(url),
            folder: dirs, 
            baseDir:  url + '/'};//url == '/' ? "" : path.join(url ,'/')};

        fsThen.readFile(path.join(server.views,"folder.ejs"),{encoding:"utf8"})
              .then(function(html){
            res.send({template:html, data:vData});
        });
        
      },
      function(err){

      });

    } else  {

      fsThen.readFile(directory)
      .then(function(file){

        if(type == "preview"){

          var result = jschardet.detect(file);
          console.log("encoding ", result.encoding);

          if(result.encoding.indexOf("GB") == 0){
            var converted = icon.decode(file, result.encoding);
            file = converted.toString('utf8');
          }else 
            file = file.toString(result.encoding);

          var vData = {navDir : getNavData(url), content:file};

          fsThen.readFile(path.join(server.views,"file.ejs"),'utf-8')
          .then(function(html){
            res.writeHead(200, {"Content-Type": "application/json;"});
            res.end(JSON.stringify({template:html, data:vData}));
          });  

        } else {
          console.log("open file")
          res.writeHead(200, {'Content-type' : mime.lookup(directory)});
          res.end(file); 
        }
      },
      function(err){});

    } 
  });

}

server.get('/', function(req,res){
  fsThen.readFile(path.join(server.views, "browse.html"))
        .then(function(html){
          res.writeHead(200, {'Content-type' : "text/html;"});
          res.end(html); 
  });
        //res.render("browse");
});

//http.createServer(server).listen(8081);
server.start(port);
server.addListener('listening', function(){
  console.log("app listening ",port);
});

};