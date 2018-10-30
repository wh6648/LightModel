/**
 * @file 系统设定相关
 * @author r2space@gmail.com
 * @module setting
 */

"use strict";

var setting = require("./setting");

/**
 * 应用版本更新确认
 * TODO: 临时使用 Setting 功能完成，根据发布方式再扩展
 * @param handler
 * @param callback
 */
exports.versioncheck = function(handler, callback) {

  var key = handler.params.name // 应用名称
    , type = "VERSION";         // 分类固定为VERSION

  setting.getOne(handler.copy({condition: {type: type, key: key}}), function(err, result) {
    if (err || !result) {
      return callback(err, {version: ""});
    }

    callback(err, {version: result.value});
  });
};

/**
 * 应用心跳确认
 * @param handler
 * @param callback
 */
exports.healthcheck = function(handler, callback) {

  // TODO: 确认内容
};
