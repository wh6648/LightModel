/**
 * @file 字符串类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "String";

exports.validator = function(key) {
  return [{ name: "$." + key, rule: ["isString"], message: "Does not meet the conditions: isString." }];
};
