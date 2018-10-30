/**
 * @file 服务器信息
 * @author r2space@gmail.com
 * @module ops/machine.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("../constant");

var Machine = {
    name:           { type: String, description: "服务器名"}
  , type:           { type: String, description: "类型 1:AP 2:DB 3:LB 4:CACHE 5:DNS" }
  , dns:            { type: String, description: "DNS" }
  , ip:             { type: String, description: "IPv4地址" }
  , ipv6:           { type: String, description: "IPv6地址" }
  , os:             { type: String, description: "操作系统" }
  , cpu:            { type: String, description: "CPU" }
  , memory:         { type: String, description: "内存" }
  , hdd:            { type: String, description: "硬盘" }
  , middleware:     { type: Array,  description: "中间件" }
  , description:    { type: String, description: "描述" }
  , valid:          { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:       { type: Date,   description: "创建时间" }
  , createBy:       { type: String, description: "创建者" }
  , updateAt:       { type: Date,   description: "最终修改时间" }
  , updateBy:       { type: String, description: "最终修改者" }
};


exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MACHINE, Machine).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MACHINE, Machine).remove(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MACHINE, Machine).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MACHINE, Machine).update(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_MACHINE, Machine).get(callback);
};