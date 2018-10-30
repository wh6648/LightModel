/**
 * @file 分类类型
 * @author r2space@hotmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , type      = require("./index")
  , category  = require("../category")
  , constant  = require("../constant")
  ;

exports.type = "Category";

/**
 * @desc 遍历所有数据，检索Category类型并查询数据库，获取附加信息
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

  var categories = {}
    , cid = type.findValueByKey(data, define, constant.OBJECT_TYPE_CATEGORY);

  if (_.isEmpty(cid)) {
    callback(undefined, categories);
    return;
  }

  var params = {
    skip: 0,
    limit: Number.MAX_VALUE,
    condition: { categoryId: { $in: cid } }
  };

  if (define.additions && define.additions.category) {
    params.select = define.additions.category.join(" ");
  }

  category.getList(handler.copy(params), function(err, result) {
    if (err || !result) {
      callback(err, categories);
      return;
    }
    _.each(result.items, function(item) {
      categories[item._doc.categoryId] = item._doc;
    });
    callback(err, categories);
  });
};
