/**
 * @file 权限定义
 * @author r2space@gmail.com
 * @module function.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./constant");

var Authority = {
    name:         { type: String, description: "名称"}
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_AUTHORITY, Authority).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_AUTHORITY, Authority).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_AUTHORITY, Authority).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_AUTHORITY, Authority).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_AUTHORITY, Authority).get(callback);
};