/**
 * @file health check for database
 * @author r2space@gmail.com
 * @module smartCore.models.mod_hcheck
 */

"use strict";

var mongo = require("mongoose")
  , schema = mongo.Schema
  , conn = require("../connection")
  , constant = require("../constant")
  ;

/**
 * @desc 国际化schema
 */
var HCheck = new schema({
    count: { type: Number, description: "检查次数" } //
  , updateAt: { type: Date, description: "最终修改时间" } //
});

/**
 * @desc 使用定义好的Schema，生成I18n的model
 * @returns {Object} hcheck model
 */
function model(code) {
  return conn.model(code, constant.MODULES_NAME_HCHECK, HCheck);
}

/**
 * @desc 检查数据库更新
 * @param {String} code 公司code
 * @param {Function} callback 回调函数，返回更新结果
 */
exports.check = function (code, callback) {

  var healthCheck = model(code);

  healthCheck.findOneAndUpdate({}, { $inc: { count: 1 }, updateAt: new Date() }, function (err, result) {
    return callback(err, result);
  });
};
