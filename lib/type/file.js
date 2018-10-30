/**
 * @file 文件类型
 * @author r2space@hotmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , file      = require("../../file")
  , type      = require("./index")
  ;

exports.type = "File";

/**
 * @desc 遍历所有数据，检索File类型并查询数据库，获取附加信息
 * @param {Object} handler
 * @param {Object} define 数据结构的定义
 * @param {Object} data 数据
 * @param {Function} callback
 * Exp.
 * {
 *   "52b7ac8f3e08d627cc000002": {_id: "52b7ac8f3e08d627cc000002", name: "a", ...}
 * }
 */
exports.getOptions = function(handler, define, data, callback) {

  var files = {}
    , fid = type.findValueByKey(data, define, constant.OBJECT_TYPE_FILE);

  if (_.isEmpty(fid)) {
    callback(undefined, files);
    return;
  }

  var params = {
    skip: 0,
    limit: Number.MAX_VALUE,
    condition: { _id: { $in: fid } }
  };

  if (define.additions && define.additions.file) {
    params.select = define.additions.file.join(" ");
  }

  file.getList(handler.copy(params), function(err, result) {
    if (err || !result) {
      callback(err, groups);
      return;
    }

    _.each(result.items, function(item) {
      files[item._doc._id.toHexString()] = item._doc;
    });
    callback(err, files);
  });
};
