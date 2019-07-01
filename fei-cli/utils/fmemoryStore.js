
function Collection(){
	this.dataset = new Array();
	this.cursor = 0;


	this.insert = function(data, fn){
		data.index = this.cursor;
		this.dataset.push(JSON.stringify(data));
		this.cursor++;
		fn(data.index);
	};

	this.insertMany = function(dataList, fn){
		var indexes = new Array();
		for (var i = 0; i < dataList.length; i++) {
			this.insert(dataList[i],function(index){
				indexes.push(index);
			});
		}
		fn(indexes);
	};

	this.find = function(query, fn){
		var index;
		for(var i in query){
			index = i;
			break;
		}
		console.log(index, query[index]);
		for(var i in this.dataset){
			var record = JSON.parse(this.dataset[i]);
			//console.log(record);
			if(record[index] == query[index]){
				fn(record, false);
				return;
			}
		}
		fn(null, true);
	};

	this.update = function(){};
	this.delete = function(){};
}

var FMemoryStore =  module.exports = function(){
	this.collections = {};
	this.collection = function(cName){
		var collection = this.collections[cName];
		if(!collection){
			collection = new Collection();
			this.collections[cName] = collection;
		}
		return collection;
	};
};

	