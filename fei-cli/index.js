
module.exports = function(){
	args = process.argv.slice(2);
	console.log(args);
	var mod = args[0];
	require("./"+mod)(args.slice(1));
};