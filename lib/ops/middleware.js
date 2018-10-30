/**
 * @file 中间件信息
 * @author r2space@gmail.com
 * @module ops/middleware.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("../constant");

var Middleware = {
    name:           { type: String, description: "名称 Mongodb,Node,..."}
  , version:        { type: String, description: "版本" }
  , source:         { type: String, description: "YUM,NPM,BOWER,..." }
  , os:             { type: String, description: "操作系统" }
  , setting:        { type: Array,  description: "配置内容" }
  , config:         { type: Array,  description: "配置内容 物理文件" }
  , description:    { type: String, description: "描述" }
  , valid:          { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:       { type: Date,   description: "创建时间" }
  , createBy:       { type: String, description: "创建者" }
  , updateAt:       { type: Date,   description: "最终修改时间" }
  , updateBy:       { type: String, description: "最终修改者" }
};


exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MIDDLEWARE, Middleware).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MIDDLEWARE, Middleware).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MIDDLEWARE, Middleware).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MIDDLEWARE, Middleware).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MIDDLEWARE, Middleware).get(callback);
};