/**
 * @file 定时信息
 * @author r2space@gmail.com
 * @module ops/cron.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("../constant");

var Cron = {
    name:     { type: String, description: "脚本名"}
  , param:    { type: String, description: "脚本参数" }
  , host:     { type: String, description: "定时主机" }
  , timing:   { type: String, description: "定时" }
  , valid:    { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt: { type: Date,   description: "创建时间" }
  , createBy: { type: String, description: "创建者" }
  , updateAt: { type: Date,   description: "最终修改时间" }
  , updateBy: { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CRON, Cron).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CRON, Cron).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CRON, Cron).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CRON, Cron).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CRON, Cron).get(callback);
};