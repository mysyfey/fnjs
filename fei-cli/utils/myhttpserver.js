
var eventEmitter = require('events').EventEmitter,
		http = require("http"),
		path=require('path'),
		mime = require('mime'),
		urlParser = require('url'),
		queryParser = require('query-string'),
		fsThen =require("./fspromise");

function myHttpServer() {

	var self= this;
	this.middlewares = [];

	this.use = function(url, handler) {
		var key;
		
		if(typeof url === 'function') {
			key="allMHS";
			handler = url;
		}else 
			key = url.indexOf("?") < url.length - 1 ? url.substr(0,url.indexOf("?") + 1) : url;

		var handlers = this.middlewares[key];
		if(handlers)
			handlers.push(handler);
		else
			this.middlewares[key] = new Array(handler);

		//console.log(key + "  "+this.middlewares.length +"  "+ JSON.stringify(this.middlewares));
	}

	this.get = function(url, handler) {
		//var u = url.indexOf("?") < url.length - 1 ? url.substr(0,url.indexOf("?") + 1) : url;
		this.addListener('GET' + url, handler);
		//console.log("add listener  " + "GET" + url);
	};

	this.post = function(url, handler) {
		//var u = url.indexOf("?") < url.length - 1 ? url.substr(0,url.indexOf("?") + 1) : url;
		this.addListener('POST' + url, handler);
		//console.log("add listener  " + "POST" + url);
		//console.log(u);
	};

	this.start = function(port, callback){

		http.createServer(function(req,res) {

			res.send = function(data){
				res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
				res.end(JSON.stringify(data));
			}

			var parsed = urlParser.parse(req.url);

			var url = req.url = decodeURI(parsed.pathname);

			if(parsed.query)
				req.query = queryParser.parse(decodeURI(parsed.query))	

			//console.log(self.middlewares.length +"  "+ JSON.stringify(self.middlewares));
			/*var url = req.url, qm = url.indexOf("?");
	
			if(url.length > 1 && qm < url.length - 1)
				url = url.substr(0,qm + 1);*/
			var eventName = req.method + url;

			 
			var mhs = self.middlewares[url];	
			var allMHS = self.middlewares["allMHS"];
			var e = {};
			e.next = true;

			/*var Middleware = function(handlers){
					this.handlers = handlers;
					this.hIndex = 0;
					var self = this;
					this.next = function(){
						if(self.hIndex < self.handlers.length)
							self.handlers[self.hIndex++](req, res, self.next);
						else
							return;
					};
			};*/


			var Middleware = function(handlers){
					var handlers = handlers, 
					hIndex = 0,
					next = function(){
						if(hIndex < handlers.length)
							handlers[hIndex++](req, res, next);
						else
							return;
					};

					next();
			};


			if(allMHS)	{
				//console.log(req.url + " allMHS  " + allMHS.length);
				Middleware(allMHS);
			}

			if(mhs) {
				//console.log(req.url + "mhs  " + mhs.length);
				Middleware(mhs);
			}
				/*for (var i = 0; i < middlewareHandlers.length; i++) {
					var nextFlag = false, next = function(){
						nextFlag = true;
					};

					middlewareHandlers[i](req,res,next);

					if(!nextFlag)
						break;
				}*/			
				/*for (var i = 0; i < middlewareHandlers.length; i++) {
				console.log(JSON.stringify(e));
					if(!e.next)
						break;

					middlewareHandlers[i](req,res,e);
				}*/
			

			//Routing

			self.emit(eventName, req, res);		

		}).listen(port, function(){
			if(callback)
				callback();
			else
				self.emit('listening');
		});
	}
}


myHttpServer.prototype = eventEmitter.prototype;

module.exports = myHttpServer;

module.exports.static = function(base){
  	var basePath = base ? base : "";

  	return function(req,res,next){

  		var file = path.join(basePath, req.url), ext = path.extname(req.url);

  		if(ext == ""){
  			console.log("static this is not a file " + file);
    		next();
  		} else {
    		fsThen.exists(file).then(function (exists) {
      		return fsThen.readFile(file);
    		}).then(function (html) {
        	res.writeHead(200, {'Content-type' : mime.lookup(path.basename(file)) + ";charset=utf-8"});
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
