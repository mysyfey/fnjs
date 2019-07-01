'use strict';

var path = require("path");

module.exports = ctx => {
  const component = ctx.extend.component;

  component.register("assetImg",path.join(__dirname,"astimg.swig"));
  component.register("heroHome",path.join(__dirname,"herohome.ejs"));
};
