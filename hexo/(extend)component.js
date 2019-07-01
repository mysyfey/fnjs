'use strict';

//hexo extend component

var fs = require("hexo-fs");
var path = require("path");

function Component(ctx) {
  this.store = {};
  this.ctx = ctx;
}

Component.prototype.list = function() {
  return this.store;
};

Component.prototype.get = function(name) {
  const store = this['store'];

  return store[name];
};

/*Component.prototype.register = function(name, fn) {

  const store = this['store'];
  store[name] = fn;

};*/

Component.prototype.register = function(name, tempFile) {

  const store = this['store'];
  const ctx= this.ctx;
  var engine = path.extname(tempFile).substr(1);
  fs.readFile(tempFile).then(content=>{    
    store[name] = (data)=>{
      //console.log("engine",engine,tempFile)
      return ctx.render.getRenderer(engine,true)
                  .call(ctx, {text:content,path:""}, data);
    };
  });
  

};
module.exports = Component;
