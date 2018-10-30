/**
 * @file 地址定义
 * @author fczs@live.cn
 * @module place.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , Mixed     = light.util.mongoose.Schema.Types.Mixed
  , constant  = require("./constant");

var Place = {
  name:           { type: String, description: "名称"}
  , parent:       { type: String, description: "父地址" }
  , sort:         { type: Number, description: "排序因子(一般按照降序)"}
  , invisible:    { type: Number, description: "不可见" , default: 0}
  , extend:       { type: Mixed,  description: "附加项(扩展用)" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).get(callback);
};

exports.getOne = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_PLACE, Place).getOne(callback);
};