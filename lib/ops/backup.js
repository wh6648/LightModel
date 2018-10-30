/**
 * @file 备份
 * @author r2space@gmail.com
 * @module ops/backup.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , Mixed     = light.util.mongoose.Schema.Types.Mixed
  , constant  = require("../constant");

var Backup = {
    name:         { type: String, description: "名称，仅标识用"}
  , source:       { type: Array,  description: "备份对象" }
  , exclude:      { type: Array,  description: "备份对象中，除外的" }
  , path:         { type: String, description: "备份路径" }
  , increment:    { type: Number, description: "增分备份 0:保存差分备份 1:不保存差分备份（只同步）" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_BACKUP, Backup).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_BACKUP, Backup).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_BACKUP, Backup).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_BACKUP, Backup).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_BACKUP, Backup).get(callback);
};