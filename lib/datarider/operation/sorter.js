/**
 * @file collection的排序
 *  http://docs.mongodb.org/manual/reference/operator/aggregation/
 * @author r2space@hotmail.com
 */

"use strict";

/**
 * 排序方法
 * @returns {string[]}
 */
exports.getAggregation = function() {
  return [
      "asc"
    , "desc"
    ];
};

/**
 * 获取排序用对象
 * @param field
 * @param order
 * @returns {{}}
 */
exports.sort = function(field, order) {

  var result = {};
  result[field] = order;

  return result;
};