/**
 * @file 存取公司信息的module
 * @author r2space@gmail.com
 * @module smartCore.models.mod_company
 */

"use strict";

var light     = require("light-framework")
  , mongo     = light.util.mongoose
  , schema    = mongo.Schema
  , Mixed     = mongo.Schema.Types.Mixed
  , conn      = light.framework.mongoconn
  , util      = light.framework.helper
  , constant  = require("../constant")
  ;

/**
 * @desc 公司schema
 */
var Company = new schema({
    code: { type: String, description: "公司CODE", unique: true } //
  , name: { type: String, description: "名称" } //
  , domain: { type: String, description: "登陆url用的domain，对应顾客编集画面的公司ID", unique: true } //
  , type: { type: String, description: "0:提案客户 1:委托客户 2:自营客户等" } //
  , extend: { type: Mixed, description: "扩展属性" } //
  , valid: { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID } //
  , createAt: { type: Date, description: "创建时间" } //
  , createBy: { type: String, description: "创建者" } //
  , updateAt: { type: Date, description: "最终修改时间" } //
  , updateBy: { type: String, description: "最终修改者" } //
});

/**
 * @desc 使用定义好的Schema，生成Company的model
 * @returns {Object} company model
 */
function model() {
  return conn.model(undefined, constant.MODULES_NAME_COMPANY, Company);
}

/**
 * 取得唯一的Code（系统内部使用）
 * 先生成随机的ID，由于改ID不能确保是唯一的，所以要在数据库中查询是否已经存在来确保获取唯一的ID。
 */
function createCode(callback) {

  var comp = model()
    , guid = util.randomGUID8();

  comp.count({ code: guid }).exec(function (err, count) {
    if (err) {
      callback(err);
      return;
    }

    if (count > 0) {
      createCode(callback);
    } else {
      callback(err, guid);
    }
  });
}

/**
 * @desc 添加公司
 * @param {Object} newComp 新的公司对象
 * @param {Function} callback 回调函数，返回添加的公司对象
 */
exports.add = function (newComp, callback) {

  createCode(function (err, code) {
    if (err) {
      callback(err);
      return;
    }

    var Comp = model();
    newComp.code = code;

    new Comp(newComp).save(function (err, result) {
      return callback(err, result);
    });
  });
};

/**
 * @desc 删除指定公司
 * @param {String} compid 公司ID
 * @param {Object} removeComp 删除用公司对象
 * @param {Function} callback 回调函数，返回删除结果
 */
exports.remove = function (compid, removeComp, callback) {

  var comp = model();

  // 逻辑删除
  removeComp.valid = constant.INVALID;

  comp.findByIdAndUpdate(compid, removeComp, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 更新指定公司
 * @param {String} compid 公司ID
 * @param {Object} updateComp 更新用公司对象
 * @param {Function} callback 回调函数，返回更新结果
 */
exports.update = function (compid, updateComp, callback) {

  var comp = model();

  comp.findByIdAndUpdate(compid, updateComp, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 获取公司有效件数
 * @param {Object} condition 检索条件
 * @param {Function} callback 回调函数，返回件数
 */
exports.total = function (condition, callback) {

  var comp = model();

  comp.count(condition).exec(function (err, count) {
    return callback(err, count);
  });
};

/**
 * @desc 获取指定公司
 * @param {String} compId 公司ID
 * @param {Function} callback 回调函数，返回公司对象
 */
exports.get = function (compId, callback) {

  var comp = model();

  comp.findById(compId, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 通过公司Code获取一个公司
 * @param {String} code 内部用公司号
 * @param {Function} callback 回调函数，返回公司对象
 */
exports.getByCode = function (code, callback) {

  var comp = model();

  comp.findOne({ code: code }, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 通过公司ID获取一个公司
 * @param {String} domain 公司的域名，一般是邮箱域名，也可以设计成与域名无关
 * @param {Function} callback 回调函数，返回公司对象
 */
exports.getByDomain = function (domain, callback) {

  var comp = model();

  comp.findOne({ domain: domain }, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 获取公司一览
 * @param {Object} condition 条件
 * @param {Number} start 数据开始位置
 * @param {Number} limit 数据件数
 * @param {Number} order 排序
 * @param {Function} callback 回调函数，返回公司一览
 */
exports.getList = function (condition, start, limit, order, callback) {

  var comp = model();

  comp.find(condition)
    .skip(start || constant.MOD_DEFAULT_START)
    .limit(limit || constant.MOD_DEFAULT_LIMIT)
    .sort(order)
    .exec(function (err, result) {
      return callback(err, result);
    });
};

/**
 * 获取Collection定义
 * @returns {*}
 */
exports.schema = function() {
  return conn.schema(Company);
};
