/**
 * @file 设备
 * @author r2space@gmail.com
 * @module device.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , Mixed     = light.util.mongoose.Schema.Types.Mixed
  , constant  = require("./constant")
  , type      = require("./type/user");

var Device = {
    token:        { type: String, description: "标识 通常是QRcode内容" }
  , qrcode:       { type: String, description: "二维码 图片ID" }
  , identifier:   { type: String, description: "设备号 设备的唯一标识" }
  , pushToken:    { type: String, description: "推送识别号 由推行服务商发行" }
  , type:         { type: String, description: "设备类型 iPhone, Android等" }
  , user:         { type: String, description: "使用者" }
  , user_name:    { type: String, description: "使用者名称" }
  , active:       { type: Date,   description: "激活日期" }
  , status:       { type: String, description: "设备状态 0:禁止 1:已激活 2:未激活"}
  , description:  { type: String, description: "描述" }
  , extend:       { type: Mixed,  description: "扩展属性" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).getList(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).remove(callback);
};

exports.removeBy = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).removeBy(callback);
};

exports.add = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).add(callback);
};

exports.update = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).update(callback);
};

exports.register = function (handler, callback) {
  handler.addParams("condition", {token: handler.params.token});
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).updateBy(callback);
};

exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).get(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 关键字检索
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回设备一览
 */
exports.search = function (handler, callback) {
  if (!handler.params.search) {
    handler.addParams("search", "user_name,identifier,type,description");
  }
  new Ctrl(handler, constant.MODULES_NAME_DEVICE, Device).search(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};


/**
 * 设定属性值
 * @param handler
 * @param result
 * @param callback
 */
function getOptions(handler, result, callback) {
  var define = handler.define || {
    selects: [{type: constant.OBJECT_TYPE_USER, item: "user"}],
    additions: {user: ["id", "name"]}
  };

  type.getOptions(handler, define, result.items || result, function(err, users) {
    (result._doc || result).options = {user: users};
    callback(err, result);
  });
}
