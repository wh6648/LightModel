/**
 * @file 数字类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "Number";

exports.validator = function(key) {
  return [{ name: "$." + key, rule: ["isNumber"], message: "Does not meet the conditions: isNumber." }];
};
