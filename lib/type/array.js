/**
 * @file 数组类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "Array";

exports.validator = function(key) {
  return [{
      name: "$." + key
    , rule: ["isArray"]
    , message: "Does not meet the conditions: isArray."
    }];
};
