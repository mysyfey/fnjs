var fs=require('fs')


var renderFile = module.exports.renderFile = function (template, data, callback) {
	fs.readFile(template,{encoding:"utf8"},(err, file)=>{	
		if(err)
			callback(null,err);
		else{
			var fn = compile(file);			
			if(fn)
				callback(fn.call(data));			
			else
				callback(null,"template error");
		}
	});
}

var render = module.exports.render = function (template, data, callback) {
	if(template) {
			/*compile(template, (fn, error)=>{
				if(!error){
					callback(fn.call(data));
				}else
					callback(null,error);
			});*/			
			var fn = compile(template);
			
			if(fn)
				callback(fn.call(data));			
			else
				callback(null,"template error");
	}
}

var compile = module.exports.compile = function (template) {

		var reg=/\s+/gm;			
		var result=template.replace(reg," ");

		reg=/\n|\r|\t/gim;
		result=result.replace(reg,"");

		reg=/("|')/g;
		result=result.replace(reg,"\\$1");
		console.log(result);
		reg=/<%((?!<%).)+%>/g;
		var scrpt = result.match(reg);
		if(!scrpt){
			return new Function("html+=\""+ result + "; return html;");
		}

		var funStr = "var html=\"\";";
		
		for (var i = 0; i < scrpt.length; i++) {
			funStr+="html+=\""+ result.substr(0,result.indexOf(scrpt[i]))+ "\";";
			result = result.substr(result.indexOf(scrpt[i]) + scrpt[i].length);			
			funStr+= scrpt[i].replace(/<%=(.*)%>/g,"html+=$1;")
														.replace(/<%(.*)%>/g,"$1");			
		}

		funStr += "return html;";
		console.log("\n" + funStr + "\n");

		return new Function(funStr);
}

function ocompile(template, callback) {
		var reg=/\s+/gm;			
		var result=template.replace(reg," ");

		reg=/\n|\r|\t/gim;
		result=result.replace(reg,"");

		reg=/("|')/g;
		result=result.replace(reg,"\\$1");
		//console.log(result);
		
		reg=/<%((?!<%).)+%>/g;
		var scrpt = result.match(reg);
		//console.log(scrpt);
		result = result.replace(reg,"<%>");
		var m = result.split("<%>");
		//console.log(m);
		var funStr = "var html=\"\";";
		
		for (var i = 0; i < m.length; i++) {
			if(m[i] != "" && m[i] != undefined)
				funStr += "html+=\""+ m[i]+ "\";";	
			if(i < scrpt.length) {
				funStr+= scrpt[i].replace(/<%=(.*)%>/g,"html+=$1;")
															.replace(/<%(.*)%>/g,"$1");
			}
		}

		funStr += "return html;";
		console.log("\n" + funStr + "\n");

		callback(new Function(funStr));
}

function compileFile(template, callback) {
	fs.readFile(template,{encoding:"utf8"},(err,data)=>{
		
	if(!err)
	{
		//var reg=/\s*|\n|\r|\t/gim;
		var reg=/\s+/gm;			
		var result=data.replace(reg," ");

		reg=/\n|\r|\t/gim;
		var result=data.replace(reg,"");

		reg=/("|')/g;
		result=result.replace(reg,"\\$1");
		
		reg=/<%[^<][^%]*%>/g;
		var scrpt = result.match(reg);
		console.log(scrpt);
		var m = result.split(reg);
		console.log(m);
		var funStr = "var html=\"\";";
		
		for (var i = 0; i < m.length; i++) {
			funStr += "html+=\""+ m[i]+ "\";";	
			if(i < scrpt.length)
				funStr+= scrpt[i];
			//console.log(i + "  " + funStr);
		}

		reg=/<%=([^%]*)%>/g;
		funStr= funStr.replace(reg,"html+=$1;");
		//console.log(funStr);
		reg=/<%([^%]*)%>/g;
		funStr= funStr.replace(reg,"$1");
		//console.log(funStr);
		funStr += "return html;";
		//reg=/("|')/g;
		//funStr=funStr.replace(reg,"\\$1");
		//funStr = "\"" + funStr + "\"";
		console.log(funStr);

		callback(new Function(funStr));

	}
	else
		console.log(err);

	});
}