var path=require('path'),
    utils = require("../utils/utils.js"),
    fsThen =require("../utils/fspromise");

/*function(req,res,next){
  var ii = req.url.indexOf("ajaxdata") ;
  if(ii<0){
    console.log("ajaxdata do not process " + ii);
    return next();
  }

  var url = utils.legalizePath(__dirname, req.url.substr(req.url.indexOf("ajaxdata") + 8)), //req.url == "/index" ? "/" : req.url,
      file = path.join(__dirname, url);
  console.log("ajaxdata processing " + url);
  fsThen.exists(file).then(function (exists) {
      return fsThen.readFile(file,'utf-8');
  }).then(function(data){

      //file
      console.log("ajaxdata read file " + file);
      var vData = {navDir : utils.dissectDirectory(url)
        , content:data};
      fsThen.readFile(path.join(__dirname,"public/views/file.ejs"),
							      	{encoding:"utf8"}).then(function(html){
        res.send({template:html, data:vData});
      });
  },
  function(err){
    //console.log("it's a directory!");
    return fsThen.readdir(file);
  }).then(function(dir){
    //directory = req.url == '/' ? "" : req.url,//path.join(req.url ,'&#92;'),
    console.log("ajaxdata processing folder " +dir); 
    var vData = {navDir : utils.dissectDirectory(url),
        folder: dir, 
        baseDir: url == '/' ? "" : path.join(url ,'/')};

    //console.log("url: "+ req.url + "  dir:"+ vData.baseDir);
    
    fsThen.readFile(path.join(__dirname,"public/views/folder.ejs"),{encoding:"utf8"})
    			.then(function(html){
        res.send({template:html, data:vData});
    });
  });
}*/

module.exports = function (dir, views, mw) {

  var magicword = mw && mw.length > 0 ? mw : "browsedoc";

  return function(req,res,next){
    var ii = req.url.indexOf(magicword) ;
    if(ii<0){
      console.log("BrowseDoc do not process " + ii);
      return next();
    }

    var url = utils.legalizePath(__dirname, 
                    req.url.substr(req.url.indexOf(magicword) + magicword.length)), //req.url == "/index" ? "/" : req.url,
        directory = path.join(dir, url);
    console.log("BrowseDoc processing url ", url, " dir ", directory);
    fsThen.exists(directory).then(function (exists) {
        return fsThen.readFile(directory,'utf-8');
    }).then(function(data){

        //file
        //console.log("BrowseDoc read file " + file);
        var vData = {navDir : utils.dissectDirectory(url)
          , content:data};
        fsThen.readFile(path.join(views,"file.ejs"),
                        {encoding:"utf8"}).then(function(html){
          res.send({template:html, data:vData});
        });
    },
    function(err){
      //console.log("it's a directory!");
      return fsThen.readdir(directory);
    }).then(function(dir){
      //directory = req.url == '/' ? "" : req.url,//path.join(req.url ,'&#92;'),
      //console.log("BrowseDoc processing folder " +dir); 
      var vData = {navDir : utils.dissectDirectory(url),
          folder: dir, 
          baseDir: url == '/' ? "" : path.join(url ,'/')};

      //console.log("url: "+ req.url + "  dir:"+ vData.baseDir);
      
      fsThen.readFile(path.join(views,"folder.ejs"),{encoding:"utf8"})
            .then(function(html){
          res.send({template:html, data:vData});
      });
    });
  };
}

