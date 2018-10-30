/**
 * @file ObjectID类型
 * @author r2space@hotmail.com
 */

"use strict";

exports.type = "ObjectID";

exports.validator = function(key) {
  return [
      { name: "$." + key, rule: ["isString"], message: "Does not meet the conditions: isString." }
    , { name: "$." + key, rule: ["isLength", 24, 24], message: "Does not meet the conditions: isLength." }
    ];
};
