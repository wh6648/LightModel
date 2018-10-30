/**
 * @file 存取数据的module
 * @author r2space@hotmail.com
 * @module light.datarider.mod_data
 */

"use strict";

var light         = require("light-framework")
  , Schema        = light.util.mongoose.Schema
  , ObjectId      = Schema.Types.ObjectId
  , conn          = light.framework.mongoconn
  , constant      = require("../constant")
  ;

var Data = new Schema({
    struct:       { type: ObjectId, description: "标识" }
  , version:      { type: String,   description: "版本" }
  , valid:        { type: Number,   description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,     description: "创建时间" }
  , createBy:     { type: String,   description: "创建者" }
  , updateAt:     { type: Date,     description: "更新时间" }
  , updateBy:     { type: String,   description: "更新者" }
  }
  , { strict: false });

/**
 * @desc 使用定义好的Schema, 通过公司Code生成Data的model
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @returns {Object} Data model
 */
function model(code, key) {
  return conn.model(code, constant.MODULES_NAME_DATASTORE_PREFIX + key, Data);
}

/**
 * @desc 添加Data
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} newData 数据
 * @param {Function} callback 回调函数，返回添加的数据
 */
exports.add = function(code, key, newData, callback) {

  var Data = model(code, key);

  new Data(newData).save(function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据ID,删除Data
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {String} dataId DataID
 * @param {Object} removeData 删除用Data对象
 * @param {Function} callback 回调函数，返回删除的Data
 */
exports.remove = function (code, key, dataId, removeData, callback) {

  var data = model(code, key);

  removeData = removeData || { };
  removeData.valid = constant.INVALID;

  data.findByIdAndUpdate(dataId, removeData, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据条件,更新Data
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {String} conditions 条件
 * @param {Object} updateData 更新用Data对象
 * @param {Function} callback 回调函数，返回更新的Data
 */
exports.update = function (code, key, conditions, updateData, callback) {

  var data = model(code, key);

  // 更新方法从findByIdAndUpdate改为update，尝试提供根据条件更新的功能 12/05
  // 直接用update方法无法返回结果集，所以改成先检索，然后根据ID更新
  data.findOne(conditions, "_id", function (err, result) {
    if (err || !result) {
      return callback(err);
    }
    data.findByIdAndUpdate(result._id, updateData, function (err, result) {
      return callback(err, result);
    });
  });
};

/**
 * @desc create the doc if it doesn't match
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} conditions 更新条件
 * @param {Object} updateData 更新用Data对象
 * @param {Object} options Options
 * @param {Function} callback 回调函数，返回更新的Data
 */
exports.upsert = function (code, key, conditions, updateData, options, callback) {

  var data = model(code, key);

  data.update(conditions, updateData, options || { upsert: true }, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 统计符合条件的件数
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} condition 查询条件
 * @param {Function} callback  回调函数，返回Data总数
 */
exports.total = function (code, key, condition, callback) {

  var data = model(code, key);

  data.count(condition, function (err, count) {
    return callback(err, count);
  });
};

/**
 * @desc 根据DataID,获取指定Data
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {String} dataId DataID
 * @param {String} select 检索项目
 * @param {Function} callback 回调函数，返回Data信息
 */
exports.get = function (code, key, dataId, select, callback) {

  var data = model(code, key);
  data.findById(dataId, select, function (err, result) {

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Data(只返回第一个有效的结果)
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} condition 查询条件
 * @param {String} select 检索项目
 * @param {Function} callback 回调函数，返回Data信息
 */
exports.getOne = function (code, key, condition, select, callback) {

  var data = model(code, key);
  data.findOne(condition, select, function (err, result) {

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Data
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} condition 查询条件
 * @param {String} select 检索项目
 * @param {Number} skip 跳过的文书数，默认为0
 * @param {Number} limit 返回的文书的上限数目，默认为20
 * @param {Object} order 排序
 * @param {Function} callback 回调函数，返回Data列表
 */
exports.getList = function (code, key, condition, select, skip, limit, order, callback) {

  var data = model(code, key);

  data.find(condition)
    .select(select)
    .skip(skip || constant.MOD_DEFAULT_START)
    .limit(limit || constant.MOD_DEFAULT_LIMIT)
    .sort(order)
    .exec(function (err, result) {
      return callback(err, result);
    });
};

/**
 * @desc 查询符合条件的文档并返回根据键分组的结果
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {String} field 分组字段
 * @param {Object} condition distinct条件
 * @param {Function} callback 回调函数，返回Distinct的结果
 */
exports.distinct = function (code, key, field, condition, callback) {

  var data = model(code, key);

  data.distinct(field, condition, function (err, result) {

    return callback(err, result);
  });
};


/**
 * 集合操作
 * TODO: 功能可以强化
 * http://docs.mongodb.org/manual/reference/sql-aggregation-comparison/
 * 操作:
 *   $first
 *   $last
 *   $max
 *   $min
 *   $avg
 *   $sum
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} condition 查询条件
 * @param {Object} group 集合操作
 * @param {Function} callback 回调函数，返回集合运算结果
 */
exports.aggregate = function(code, key, condition, group, callback) {

  var data = model(code, key);

  data.aggregate([
    { $match: condition }
  , { $group: {_id: 0, value: group} }
  , { $project: {_id: 0, value: 1} }
  ], function(err, result) {
    callback(err, result);
  });
};

/**
 * 集合操作(未封装版)
 * TODO: 功能可以强化
 * http://docs.mongodb.org/manual/reference/sql-aggregation-comparison/
 * 操作:
 *   $first
 *   $last
 *   $max
 *   $min
 *   $avg
 *   $sum
 * @param {String} code 公司code
 * @param {String} key Data对象的schema名
 * @param {Object} condition aggregate的各种条件
 * @param {Function} callback 回调函数，返回集合运算结果
 */
exports.originalAggregate = function (code, key, condition, callback) {

  var data = model(code, key);

  data.aggregate(condition, function (err, result) {
    callback(err, result);
  });
};

