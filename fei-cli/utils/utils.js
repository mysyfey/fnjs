var fs=require('fs'),
    fsPromises =require("./fspromise"),
    path=require('path');

module.exports.dissectDirectory = function(uri) {
  //console.log("dissectDirectory " + uri);
    var parsed = path.parse(uri), dissected = new Array, i = 0;

    while(true) {  
      dissected.push({name:parsed.base,link:path.format(parsed)});
      //console.log(JSON.stringify(dissected));
      //console.log(parsed.dir);
      //console.log("dd " + i++ + "  dir" +parsed.dir);
      if(parsed.dir == "\\" || parsed.dir == "/"){
        dissected.push({name:parsed.dir,link:parsed.dir});
        return dissected.reverse();
      }else
        parsed = path.parse(parsed.dir);  
      
    }
      return dissected;
};

module.exports.legalizePath = function(dirname, p) {
  var newPath = path.join(dirname,p), len = dirname.length;
  newPath = newPath.substr(newPath.indexOf(dirname) + len);
  //console.log("legalize " + dirname+p+" to " + newPath)
  return newPath;
}

var getFiles = module.exports.getFiles = function(rootPath, rp){

  return new Promise(function(resolve,reject){

    var files = [];

    fsPromises.readdir(rootPath,{"withFileTypes":true, "encoding":"utf8"})
    .then(function(dirents){

      var asynTasks = 0, itrtCompleted = false;

      for (var i = 0; i < dirents.length; i++) {
        var dir = path.join(rootPath,dirents[i].name);
        if(dirents[i].isFile()){
          files.push(dir.split(rp)[1]);
        }else{
          asynTasks++;

          getFiles(dir,rp)
          .then(function(subFiles){

            for (var a = subFiles.length - 1; a >= 0; a--) {
              files.push(subFiles[a]);
            }                
            asynTasks--;
            if(itrtCompleted && asynTasks == 0)
              resolve(files);
          });
        }
      }
      itrtCompleted = true;
      if(asynTasks == 0){
          resolve(files);
      }

    },function(err){
      console.log("getFiles ",err);
    });   
  }); 
};


var FPromise = module.exports.FPromise = function(func){
      this.func_ = func;
      this.links = [];
      var self = this;


      this.reject = function (){
        if(self.links.length > 0){
          var handlers = self.links.shift();
          var next = handlers.rej(arguments);
          {
              if(next) {
                next.links = self.links;
              }else {
                self.reject();
              }
            
          };
        }
      };

      this.resolve = function (){
        if(self.links.length > 0){
          var handlers = self.links.shift();
          var next = handlers.res(arguments);
          {
              if(next) {
                next.links = self.links;
              }else {
                self.resolve();
              }
            
          };
        }
      };

      this.then=function(resolve,reject){
        console.log("then");
        this.links.push({"res":resolve,"rej":reject});
        return this;
      };

      /*this.then=function(resolve,reject){
        if(isLink){
          this.links.push({"res":resolve,"rej":reject});
        }else {
          this.func_(function()
          {
            if(resolve){

             var nextRes = function(linkRes){
               var next = resolve(arguments);
               {
                 var handlers = linkRes.shift();
                 if(next) {
                  next.links = self.links;
                  next(handlers.res, handlers.rej);
                 }else {
                  nextRes(linkRes);
                 }
               }
             };

             nextRes(self.links);

            }
          },function()
          {
            if(reject) {
              self.next = reject(arguments);
            }
          });
        }
        this.isLink = true;
        return this;
      };*/
      process.nextTick(() => {
        console.log("tick");
        this.func_(this.resolve,this.reject);
      });
      return this;

    };