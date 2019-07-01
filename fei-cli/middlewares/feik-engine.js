module.exports = function(){
	var feikRender = function(fileName,data){
			fsThen.readFile(path.join(server.viewsDir,fileName),{encoding:"utf8"})
						.then(function(html){
	    				res.end(JSON.stringify({"template":html, data:data}));
			});
	};
	
	return function(req,res,next){
		res.feikRender = feikRender;
	};
}