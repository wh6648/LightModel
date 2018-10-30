/**
 * @file 角色定义
 * @author r2space@gmail.com
 * @module role.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./constant")
  ;

var Role = {
    name:         { type: String, description: "名称"}
  , type:         { type: String, description: "权限分类"}
  , roles:        { type: Array,  description: "包含的角色" }
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ROLE, Role).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ROLE, Role).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ROLE, Role).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ROLE, Role).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ROLE, Role).get(callback);
};
