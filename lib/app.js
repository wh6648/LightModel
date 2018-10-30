/**
 * @file 应用程序定义
 * @author r2space@gmail.com
 * @module app.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./constant");

var App = {
    name:         { type: String, description: "名称"}
  , domain:       { type: String, description: "应用程序标识"}
  , icon:         { type: String, description: "应用程序图标"}
  , database:     { type: String, description: "使用的数据库"}
  , company:      { type: String, description: "公司"}
  , owner:        { type: String, description: "管理员"}
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  handler.addParams("condition", {valid: constant.VALID});
  control(handler).getList(callback);
};

exports.remove = function (handler, callback) {
  control(handler).remove(callback);
};

exports.add = function (handler, callback) {
  control(handler).add(callback);
};

exports.update = function (handler, callback) {
  control(handler).update(callback);
};

exports.get = function (handler, callback) {
  control(handler).get(callback);
};

exports.getOne = function (handler, callback) {
  control(handler).getOne(callback);
};

function control(handler) {
  handler.code = constant.SYSTEM_DB;
  return new Ctrl(handler, constant.MODULES_NAME_APP, App);
}
