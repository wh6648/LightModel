/**
 * @file 组类型
 * @author r2space@hotmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , type      = require("./index")
  , constant  = require("../constant")
  , group     = require("../group")
  ;

exports.type = "Group";

/**
 * @desc 遍历所有数据，检索Group类型并查询数据库，获取附加信息
 * @param {Object} handler
 * @param {Object} define 数据结构的定义
 *  {
 *    selects: [{type: "1", item: "object.path"}]
 *    additions: {group: ["name", "type"]}
 *  }
 * @param {Object} data 数据
 * @param {Function} callback
 * Exp.
 * {
 *   "52b7ac8f3e08d627cc000002": {_id: "52b7ac8f3e08d627cc000002", name: "a", ...}
 * }
 */
exports.getOptions = function(handler, define, data, callback) {

  var groups = {}
    , gid = type.findValueByKey(data, define, constant.OBJECT_TYPE_GROUP);

  if (_.isEmpty(gid)) {
    callback(undefined, groups);
    return;
  }

  var params = {
    skip: 0,
    limit: Number.MAX_VALUE,
    condition: { _id: { $in: gid } }
  };

  if (define.additions && define.additions.group) {
    params.select = define.additions.group.join(" ");
  }

  group.getList(handler.copy(params), function(err, result) {
    if (err || !result) {
      callback(err, groups);
      return;
    }

    _.each(result.items, function(item) {
      groups[item._doc._id.toHexString()] = item._doc;
    });
    callback(err, groups);
  });
};
