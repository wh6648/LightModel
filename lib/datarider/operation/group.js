/**
 * @file collection组数据操作
 *  http://docs.mongodb.org/manual/reference/operator/aggregation/
 * @author r2space@hotmail.com
 */

"use strict";

exports.getGroupOperation = function() {
  return [
      "$first"
    , "$last"
    , "$max"
    , "$min"
    , "$avg"
    , "$sum"
    , "$count"
    ];
};
