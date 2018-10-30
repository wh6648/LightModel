/**
 * @file 角色定义
 * @author r2space@gmail.com
 * @module role.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./constant");

var ACLink = {
    resource:     { type: String, description: "资源" }
  , resourceType: { type: String, description: "资源类型（1:画面 2:API 3:File）" }
  , target:       { type: Array,  description: "分配对象（用户/组/角色），{id: targetid, type: user|group|role}" }
  , auth:         { type: Array,  description: "权限名称" }
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ACLINK, ACLink).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ACLINK, ACLink).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ACLINK, ACLink).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ACLINK, ACLink).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_ACLINK, ACLink).get(callback);
};
