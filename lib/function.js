/**
 * @file 系统机能设定
 * @author r2space@gmail.com
 * @module function.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , cache     = light.framework.cache
  , constant  = require("./constant");

var Function = {
    app:          { type: String, description: "应用"}
  , type:         { type: String, description: "类型"}
  , name:         { type: String, description: "名称"}
  , menu:         { type: String, description: "菜单标识"}
  , parent:       { type: String, description: "父菜单"}
  , url:          { type: String, description: "URL" }
  , description:  { type: String, description: "描述" }
  , order:        { type: String, description: "顺序" }
  , icon:         { type: String, description: "图标" }
  , active:       { type: String, description: "有效 0:disabled 1:enabled Disable时是禁用按钮" }
  , public:       { type: String, description: "公开 0:invisible 1:visible" }
  , role:         { type: Array,  description: "权限" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {

  // 固定获取全部
  handler.addParams("start", 0);
  handler.addParams("limit", Number.MAX_VALUE);

  var functions = cache.get("function", "list");
  if (functions) {
    callback(undefined, functions);
    return;
  }

  // 设定缺省排序
  if (!handler.params.order) {
    handler.addParams("order", "order");
  }

  new Ctrl(handler, constant.MODULES_NAME_FUNCTION, Function).getList(function (err, result) {
    if (err) {
      callback(err);
      return;
    }
    //由于菜单数据存储在app表，所以当code为空时时查询结果为空，所以不缓存。
    if (handler.code) {
      cache.set("function", "list", result);
    }
    callback(err, result);
  });
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FUNCTION, Function).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FUNCTION, Function).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FUNCTION, Function).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FUNCTION, Function).get(callback);
};