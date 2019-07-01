var path=require('path'),
		fsThen =require("../utils/fspromise");

module.exports = function (server, db) {

	server.get('/', function(req,res){
		res.render("auth");
		//var file = path.join(server.viewsDir,"auth.html");
		/*fsThen.readFile(file,{encoding:"utf8"})
        .then(function(html){
          res.writeHead(200, {'Content-type' : "text/html;charset=utf-8"});
          res.end(html); 
        });*/
	});

	server.post('/login/?', function(req,res){
		console.log("post('/login/?'", req.body);

		if(req.body.username && req.body.password){

			var collection = db.collection("users");

			res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});

			collection.findOne({"username":req.body.username}).then(function(user){
					
				if(user) {
					console.log("logged in found " , user);
					if(user.password == req.body.password){
						res.locals.session.user = user;
						//res.render("main",{"username":user.username});
						fsThen.readFile(path.join(server.viewsDir,"main.ejs"),{encoding:"utf8"})
						.then(function(html){
	    				res.end(JSON.stringify({"template":html, data:{"username":user.username}}));
						});

					}else {
						console.log("auth error " , req.body.username);
						res.render("error",{"error": "authentication failed"});
    				//res.end(JSON.stringify({data:{"status":-1, "reason": "authentication failed"}}));						
					}
				} else {
					console.log("user does not exist " , req.body.username);
						res.render("error",{"error": "user does not exist"});
    			//res.end(JSON.stringify({data:{"status":-1, "reason": "user does not exist"}}));
				}

			},function(er){
				console.log("findOne error" , req.body.username);
				res.render("error",{"error": "find error"});
				//res.end(JSON.stringify({data:{"error": "find error"}}));
			});
		}
	});

	server.post('/register/?', function(req,res){
		console.log("post('/register/?'", req.body);
		if(req.body.username && req.body.password){

			var collection = db.collection("users");
			//res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});

			collection.findOne({"username":req.body.username}).then(function(user){
				
				console.log("findOne" ,  user);
				if(user){
					console.log("error user existed");
					res.render("error",{"error": "user existed"});
    			//res.end(JSON.stringify({data:{"status":-1, "reason": "user existed"}}));
				} else 
					return collection.insertOne({
						"username": req.body.username,
						"password":req.body.password});		

			}).then(function(newUser){
				if(newUser && newUser.ops.length){
					console.log("insert new user " , newUser.ops[0].username, " id:",newUser.ops[0]._id);
					res.send(200);
    			//res.end(JSON.stringify({data:{"status":1}}));
				}
			},function(error){
				console.log("insert error" , error);
				res.render("error",{"error": "register error"});
    		//res.end(JSON.stringify({data:{"status":-1, "reason": "register error"}}));
			});
		}
	});
};