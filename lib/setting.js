/**
 * @file 系统设定相关
 * @author r2space@gmail.com
 * @module setting
 */

"use strict";

var light     = require("light-framework")
  , mongo     = light.util.mongoose
  , Ctrl      = light.framework.mongoctrl
  , Schema    = mongo.Schema
  , Mixed     = Schema.Types.Mixed
  , constant  = require("./constant");

var Setting = {
    type:         { type: String, description: "分类" }
  , key:          { type: String, description: "标识" }
  , value:        { type: String, description: "值" }
  , option:       { type: Mixed,  description: "附加项" }
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.get = function(handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).get(callback);
};

exports.set = function(handler, callback) {

  var ctrl = new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting);
  ctrl.total(function(err, count){
    if (count > 0) {
      ctrl.updateBy(function(err, result) {
        callback(err, result);
      });
    } else {
      ctrl.add(callback);
    }
  });
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).update(callback);
};

exports.updateBy = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).updateBy(callback);
};


exports.getOne = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_SETTING, Setting).getOne(callback);
};
