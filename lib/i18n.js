/**
 * @file 多国语言词条
 * @author r2space@gmail.com
 * @module i18n.js
 */

"use strict";

var light       = require("light-framework")
  , Ctrl        = light.framework.mongoctrl
  , constant    = require("./constant")
  , Mixed       = light.util.mongoose.Schema.Types.Mixed
  ;

var I18n = {
    category: { type: String, description: "分类 按app名分类", default: constant.DEFAULT_I18N_CATEGORY } //
  , key:      { type: String, description: "词条key" }
  , lang:     { type: Mixed,  description: "翻译结果" }
  , valid:    { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt: { type: Date,   description: "创建时间" }
  , createBy: { type: String, description: "创建者" }
  , updateAt: { type: Date,   description: "最终修改时间" }
  , updateBy: { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_I18N, I18n).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_I18N, I18n).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_I18N, I18n).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_I18N, I18n).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_I18N, I18n).get(callback);
};
