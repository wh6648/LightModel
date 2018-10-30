/**
 * @file 组合类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "Mixed";

exports.validator = function(key) {
  return [{
      name: "$." + key
    , rule: ["isObject"]
    , message: "Does not meet the conditions: isObject."
    }];
};

