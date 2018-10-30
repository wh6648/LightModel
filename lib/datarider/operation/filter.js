/**
 * @file collection的过滤器
 *  http://docs.mongodb.org/manual/reference/operator/aggregation/
 * @author r2space@hotmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , log       = light.framework.log
  , type      = require("../../type");

/**
 * 结合操作
 * @returns {string[]}
 */
exports.getAggregation = function() {
  return [
      "$and"
    , "$or"
    , "$not"
    ];
};

/**
 * 比较操作
 * @returns {string[]}
 */
exports.getComparison = function() {
  return [
      "$eq"
    , "$gt"
    , "$gte"
    , "$lt"
    , "$lte"
    , "$ne"
    , "$in"
    , "$nin"
    , "$regex"
    ];
};

/**
 * 生成比较用对象
 * @param field
 * @param value
 * @param operator
 * @param datatype
 * @returns *
 */
exports.compair = function(field, value, operator, datatype) {

  // 检查操作符是否被支持
  if (_.indexOf(exports.getComparison(), operator) < 0) {

    log.error("Operation not to be supported");
    return undefined;
  }

  var result = {};

  // 处理等号操作符
  if ("$eq" === operator) {

    if (datatype === "Array") { // 数组类型做直接比较，值为字符串，所以不进行类型转换
      result[field] = value;
    } else {
      result[field] = type.parse(datatype, value);
    }
    return result;
  }

  // 其他操作符
  result[field] = {};
  result[field][operator] = type.parse(datatype, value);

  return result;
};

