/**
 * @file 地址定义
 * @author r2space@gmail.com
 * @module log.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./../constant");

var Log = {
    time:     { type: Date,   description: "日志输出时间" }
  , uid:      { type: String, description: "执行操作的用户的标识" }
  , host:     { type: String, description: "产生日志的机器的IP地址" }
  , source:   { type: String, description: "产生日志的软件分类" }
  , type:     { type: String, description: "日志类型，audit | operation | application" }
  , level:    { type: String, description: "日志输出级别" }
  , code:     { type: String, description: "信息编号" }
  , message:  { type: String, description: "详细信息" }
  , file:     { type: String, description: "输出日志的代码文件" }
  , line:     { type: String, description: "输出日志的代码在文件中的行号" }
};

exports.getList = function (handler, callback) {

  var params = handler.params
    , collection = params.source + "." + params.type;

  new Ctrl(handler, collection, Log).getList(callback);
};

exports.get = function (handler, callback) {

  var params = handler.params
    , collection = params.source + "." + params.type;

  new Ctrl(handler, collection, Log).get(callback);
};