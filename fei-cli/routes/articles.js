var fsThen =require("../utils/fspromise");

module.exports = function (server, memoryStore) {
		server.get('/blog', function(req,res){

		  fsThen.readFile(path.join(__dirname, "public/views/blog.html"),{encoding:"utf8"})
		        .then(function(html){
		          res.writeHead(200, {'Content-type' : "text/html;charset=utf-8"});
		          res.end(html); 
		        });
		});

		server.get('/blog/article', function(req,res){
		  var collection = memoryStore.collection("blog");
		  collection.find({"title":req.query.title}, function(article, err){
		  	res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
		  	if(!err){
		  		console.log("found article");
		      res.end(JSON.stringify({article:article.title + "\n" +article.content})); 
		  	} else
		  	{
		  		console.log("no article ", req.query.title);
		  		res.end(JSON.stringify({article:"no article "}));
		  	}
		  });
		});

		server.post('/blog/article', function(req,res){
		  var collection = memoryStore.collection("blog");
		  collection.insert({"title":req.body.title,"content":req.body.content}, 
		  	function(articleIndex){
		  	
		  		console.log("article ", articleIndex);
		      res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
		      res.end(JSON.stringify({article:articleIndex})); 
		  	
		  });
		});
};