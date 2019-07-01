module.exports = function(arg){
	var str = "" + arg[0];
	var any = "sad,angry,depressed";
	var splits = any.split(",");

	for (var i = 0; i < splits.length; i++) {
		var reg = new RegExp(splits[i]);
		var m = str.match(reg)
		console.log(m);
		if(m){
			return process.stdout.end(splits[i]);
		}
	}

	return process.stdout.end("nothing");
};