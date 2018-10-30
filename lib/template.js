/**
 * @file 模板定义
 * @author r2space@gmail.com
 * @module template.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , _         = light.util.underscore
  , constant  = require("./constant");

var Template = {
    name:         { type: String, description: "名称"}
  , type:         { type: Number, description: "模板类型 1:通知模板 2:回答模板 3:定期模板 4:应用模板"}
  , draft:        { type: Number, description: "临时保存 0:正式版 1:临时保存"}
  , items:        { type: Array,  description: "项目" }
  , description:  { type: String, description: "描述" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  var condition = handler.params.condition || {};
  condition.valid = _.isUndefined(condition.valid) ? constant.VALID : condition.valid;

  handler.addParams("condition", condition);
  new Ctrl(handler, constant.MODULES_NAME_TEMPLATE, Template).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TEMPLATE, Template).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TEMPLATE, Template).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TEMPLATE, Template).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TEMPLATE, Template).get(callback);
};
