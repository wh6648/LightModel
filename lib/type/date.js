/**
 * @file 日期类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "Date";

exports.validator = function(key) {
  return [{ name: "$." + key, rule: ["isDate"], message: "Does not meet the conditions: isDate." }];
};
