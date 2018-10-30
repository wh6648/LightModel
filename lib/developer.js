/**
 * @file 应用程序管理员
 * @author r2space@gmail.com
 * @module developer.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , errors    = light.framework.error
  , log       = light.framework.log
  , constant  = require("./constant")
  , auth      = require("./security");

var Developer = {
    id:       { type: String, description: "用户标识" }
  , name:     { type: String, description: "用户称" }
  , password: { type: String, description: "密码" }
  , type:     { type: Number, description: "用户类型" }
  , email:    { type: String, description: "电子邮件地址" }
  , phone:    { type: String, description: "电话号码" }
  , lang:     { type: String, description: "语言" }
  , timezone: { type: String, description: "时区" }
  , status:   { type: String, description: "状态" }
  , valid:    { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt: { type: Date,   description: "创建时间" }
  , createBy: { type: String, description: "创建者" }
  , updateAt: { type: Date,   description: "最终修改时间" }
  , updateBy: { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  control(handler).getList(callback);
};

exports.remove = function (handler, callback) {
  control(handler).remove(callback);
};

exports.add = function (handler, callback) {
  control(handler).add(callback);
};

exports.update = function (handler, callback) {
  control(handler).update(callback);
};

exports.get = function (handler, callback) {
  control(handler).get(callback);
};

exports.verify = function(handler, callback) {
  control(handler).getOne(function (err, result) {
    if (err) {
      log.debug("Unable to retrieve the user.");
      return callback(new errors.db.Find());
    }

    if (!result) {
      log.debug("User does not exist.");
      return callback(new errors.db.NotExist());
    }

    if (result.password !== auth.sha256(handler.params.password)) {
      log.debug("The user password is not correct.");
      return callback(new errors.db.NotCorrect());
    }

    delete result._doc.password;
    return callback(err, result);
  });
};

function control(handler) {
  handler.code = constant.SYSTEM_DB;
  return new Ctrl(handler, constant.MODULES_NAME_DEVELOPER, Developer);
}
