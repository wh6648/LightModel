/**
 * @file 用户类型
 * @author r2space@hotmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , user      = require("../user")
  , type      = require("./index")
  , constant  = require("../constant")
  ;

exports.type = "User";

/**
 * @desc 遍历所有数据，检索User类型并查询数据库，获取附加信息
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

  var users = {}
    , uid = type.findValueByKey(data, define, constant.OBJECT_TYPE_USER);

  if (_.isEmpty(uid)) {
    callback(undefined, users);
    return;
  }

  var params = {
    skip: 0,
    limit: Number.MAX_VALUE,
    condition: { _id: { $in: uid } }
  };

  if (define.additions && define.additions.user) {
    params.select = define.additions.user.join(" ");
  }

  user.getList(handler.copy(params), function(err, result) {
    if (err || !result) {
      callback(err, users);
      return;
    }

    _.each(result.items, function(item) {
      users[item._doc._id.toHexString()] = item._doc;
    });
    callback(err, users);
  });
};

