/**
 * @file 布尔类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "Boolean";

exports.validator = function(key) {
  return [{ name: "$." + key, rule: ["isBoolean"], message: "Does not meet the conditions: isBoolean." }];
};
