var mime = require('mime'),
    path=require('path'),
    fsThen =require("../utils/fspromise");

module.exports = function(base){
  	var basePath = base ? base : "";

  	return function(req,res,next){

      if(req.url == "/")
        next();

      //console.log(basePath," b ", req.url);

  		var file = path.join(basePath, req.url), ext = path.extname(req.url);

  		if(ext == ""){
  			//console.log("fstatic do not process folder " ,file);
    		next();
  		} else {
    		fsThen.exists(file).then(function (exists) {
      		return fsThen.readFile(file,{encoding:"utf8"});
    		}).then(function (html) {
          console.log(file);
        	res.writeHead(200, {'Content-type' : mime.lookup(path.basename(file))});
        	res.end(html);
      	},function (err) {
          	console.log("static read file error "+file + "   " + err);
          	next();
          	//res.writeHead(404, {'Content-type' : 'plain/text'});
          	//res.end("static resource read file error")
      	});
  		}
  	//}
  	};
	};