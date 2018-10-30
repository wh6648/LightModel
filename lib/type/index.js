/**
 * @file 类型定义
 * @author r2space@hotmail.com
 */

"use strict";

var light           = require("light-framework")
  , _               = light.util.underscore
  , async           = light.util.async
  , moment          = light.util.moment
  , log             = light.framework.log
  , helper          = light.framework.helper
  , category        = require("./category")
  , group           = require("./group")
  , user            = require("./user")
  ;

/**
 * 给定的数据集里获取ID
 * @param json 给定的数据
 *  array
 *  object
 * @param define ID所在的位置
 *  {
 *    selects: [{type: "1", item: "object.path"}]
 *  }
 * @param type 用户 组 文件 分类
 * @returns {*}
 */
exports.findValueByKey = function(json, define, type) {

  if (!json || !define) {
    return [];
  }

  var result = [];
  define = define._doc || define;

  _.each(define.selects, function(select) {

    // 指定了类型，则只检索指定类型
    if (select.type && select.type !== type) {
      return;
    }

    // 抽取数据
    result.push(helper.lookup(json, select.item));
  });

  return _.compact(_.uniq(_.flatten(result)));
};

exports.parse = function(type, val) {

  var result = val;
  if (_.isNull(val) || _.isUndefined(val)) {
    return val;
  }
  try {
    switch(type) {
      case "Number":
        result = parseNumber(val);
        break;
      case "Boolean":
        result = parseBoolean(val);
        break;
      case "Date":
        result = moment(val).toDate();
        break;
      case "Array":
        result = parseArray(val);
        break;
      case "Mixed":
        result = parseMixed(val);
        break;
      default:
        result = val;
        break;
    }
  } catch (e) {
    log.error(e);
  }

  return result;
};

function parseArray(val) {
  var result = val;
  if (_.isString(val)) {
    try {
      result = JSON.parse(val);
    } catch(e) {
      log.error("invalid array.", null);
    }
  }
  return result;
}

function parseMixed(val) {
  var result = val;
  if (_.isString(val)) {
    try {
      result = JSON.parse(val);
    } catch(e) {
      log.error("invalid mixed.", null);
    }
  }
  return result;
}

function parseNumber(val) {
  if (isNaN(val)) {
    return null;
  } else {
    return Number(val);
  }
}

function parseBoolean(val) {
  return val !== 'false' && val !== '0';
}

/**
 * @desc 遍历所有数据，根据字段类型（User，Group，Category）查询数据库，获取附加信息
 * @param {Object} handler
 * @param {Object} define 数据结构的定义
 * @param {Object} data 数据
 * @param {Function} callback
 * Exp.
 * {
 *   user: [{
 *     "52b7ac8f3e08d627cc000002": {_id: "52b7ac8f3e08d627cc000002", userName: "a", ...}
 *   }]
 *   group: []
 *   category: []
 * }
 */
exports.getOption = function(handler, define, data, callback) {

  var options = {};

  // 获取组信息
  var getGroup = function(done) {
    group.getOptions(handler, define, data, function(err, result) {
      options.group = result;
      done(err);
    });
  };

  // 获取用户信息
  var getUser = function(done) {
    user.getOptions(handler, define, data, function(err, result) {
      options.user = result;
      done(err);
    });
  };

  // 获取分组信息
  var getCategory = function(done) {
    category.getOptions(handler, define, data, function(err, result) {
      options.category = result;
      done(err);
    });
  };

  async.waterfall([getGroup, getUser, getCategory], function(err) {
    callback(err, options);
  });
};
