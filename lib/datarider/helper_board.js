/**
 * @file Board的帮助类
 * @author r2space@gmail.com
 */

"use strict";

var light           = require("light-framework")
  , util            = light.lang.util
  , _               = light.util.underscore
  , numeral         = light.util.numeral
  , context         = light.framework.context
  , errors          = light.framework.error
  , log             = light.framework.log
  , helper          = light.framework.helper
  , cache           = light.framework.cache
  , filter          = require("./operation/filter")
  , sorter          = require("./operation/sorter")
  , board           = require("./ctrl_board")
  , constant        = require("../constant")
  ;


function isEmpty(str) {
  return _.isUndefined(str) || _.isNull(str) || _.str.isBlank(str);
}

function getChildKey(key) {
  return key.split(".")[1];
}

function getKey(key) {
  return key.split(".")[0];
}

function format(val, f) {
  if (isEmpty(f)) {
    return val;
  }

  // Format number
  if (_.isNumber(val)) {
    return numeral(val).format(f);
  }

  // Format string
  if (_.isString(val)) {
    return util.format(f, val);
  }

  return val;
}

function canExtend(val) {
  if (!_.isObject(val))   { return false; }
  if (_.isArray(val))     { return false; }
  if (_.isDate(val))      { return false; }
  if (_.isFunction(val))  { return false; }
  if (_.isRegExp(val))    { return false; }
  return _.isArguments(val);
}

function extend(dest, from) {

  var props = Object.getOwnPropertyNames(from), destination;
  props.forEach(function (name) {
    if (canExtend(from[name])) {
      dest[name] = dest[name] || {};
      extend(dest[name] || {}, from[name]);
    } else {
      destination = Object.getOwnPropertyDescriptor(from, name);
      Object.defineProperty(dest, name, destination);
    }
  });
}

function parseReservedParams(handler, keyword) {
  if (keyword === "$uid") {
    return handler.uid;
  }
  return undefined;
}

/**
 * @desc 获取模块路径
 * @param key
 * @returns {String}
 */
function sourcePath(key) {
  return /^\/.*/.test(key) ? key : constant.PATH_CONTROLLER + key;
}

/**
 * 调用ctrl操作数据之前，调用指定的controller/board类的before方法
 * 用途：对handler进行调整
 * @param define
 * @param handler
 * @param callback
 */
exports.beforeTrigger = function(define, handler, callback) {

  var patch = sourcePath(define.key), inject = helper.resolve(patch);
  if (!inject) {
    callback(null, handler);
    return;
  }

  var method = define.advance.before;
  if (inject[method]) {
    inject[method].call(define, handler, callback);
  } else {
    callback(null, handler);
  }
};

/**
 * 调用ctrl操作数据之前，调用指定的controller/board类的after方法
 * 用途：对数据进行调整
 * @param define
 * @param data
 * @param callback
 */
exports.afterTrigger = function(define, data, callback) {

  var patch = sourcePath(define.key), inject = helper.resolve(patch);
  if (!inject) {
    callback(null, data);
    return;
  }

  var method = define.advance.after;
  if (inject[method]) {
    inject[method].call(define, data, callback);
  } else {
    callback(null, data);
  }
};

/**
 * @desc 获取board信息
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "FR"
 *  schemaName: "Message"
 *  key: "TimeLine"
 * @param {Function} callback 回调函数
 */
exports.findBoardInfo = function(handler, callback) {

  var params = handler.params
    , condition = {
      appName: params.appName
    , schemaName: params.schemaName
    , key: params.boardName
    , valid: 1
    };

  // 尝试从缓存里取值
  var boards = cache.get(condition.appName, condition.schemaName, condition.key);
  if (boards) {
    callback(undefined, boards);
    return;
  }

  // 从数据库里取
  var newHandler = new context().create(handler.uid, handler.code, handler.lang);
  newHandler.addParams("condition", condition);

  board.getOne(newHandler, function(err, result) {
    if (err) {
      log.error(err, handler.uid);
      callback(new errors.db.Find());
      return;
    }

    // TODO: 没有数据时，出错
    cache.set(condition.appName, condition.schemaName, condition.key, result)
    callback(err, result);
  });
};

/**
 * 生成条件字符串
 * @param {Object} define
 * @param data
 * @returns {{}}
 */
exports.getFilter = function(define, handler) {

  // 如果定义了自由条件，则对检索条件框架不做任何处理
  if (handler.params && handler.params.freeFilter) {
    return handler.params.freeFilter;
  }

  var data = handler.params.filter || handler.params;
  var result = {};
  _.each(define.filters, function(field) {
    var value = "";
    if (isEmpty(field.operatorParam)) {
      value = field.operatorValue;
    } else {

      if (_.isUndefined(data[field.operatorParam])) {
        // 如果没指定，则用缺省值
        value = parseReservedParams(handler, field.operatorParam) || field.operatorValue;
      } else {
        // 参数名称被指定时，参数中指定的值优先成为比较条件
        value = parseReservedParams(handler, field.operatorParam) || data[field.operatorParam];
      }
    }

    if (!(_.isUndefined(value) || value === "")) { // 允许null的比较，所以去掉isNull的判断

      var type = getTypeByStruct(define, field.item);
      if (result[field.item]) {
        extend(result[field.item], filter.compair(field.item, value, field.operator, type)[field.item]);
      } else {
        extend(result, filter.compair(field.item, value, field.operator, type));
      }
    }
  });

  return result;
};

/**
 * 查看structure定义，获取指定字段的类型
 * 支持子文档类型的获取
 * @param define
 * @param field
 * @returns {*}
 */
function getTypeByStruct(define, field) {
  var keys = field.split(".");
  var struct = _.find(define.struct, function(item) {
    return item.key == keys[0];
  });

  if (struct.type === "Mixed" || struct.type === "Array") {

    // 没有定义子文档的类型
    if (struct.sub.length <= 0) {
      return struct.type;
    }

    // 包含子文档时，检索子文档的类型
    var sub = _.find(struct.sub, function(item) {
      return item.name == keys[1];
    });
    return sub.type;
  } else {
    return struct.type;
  }
}

exports.getSort = function(define, data) {

  var sorts = _.sortBy(define.sorts, function(sort) {
    return sort.index;
  });

  var result = {};
  _.each(sorts, function(sort) {
    if (sort.dynamic === "1") {
      extend(result, sorter.sort(sort.item, sort.order));
      return;
    }

    // dynamic sort column
    if (data && !isEmpty(data[sort.item])) {
      extend(result, sorter.sort(data[sort.item], sort.order));
    }
  });

  return result;
};

/**
 * 1. 只拷贝被选择的项目
 * 2. 如果定义了format或alias，则进行格式化和重命名
 * 3. 支持内嵌文档的拷贝，只支持两层结构
 * @param data
 * @param define
 * @returns {{}}
 */
exports.reject = function(data, define) {

  var result = {};

  _.each(define.selects, function(column) {

    if (column.select === "1" && data) {

      var child = getChildKey(column.item);
      if (child) {
        var parent = getKey(column.item), key = column.alias || child, val = data[parent];

        // array 遍历数组，拷贝指定的值
        if (_.isArray(val)) {

          var arrayVal = result[parent] || [];
          _.each(val, function(item, index) {
            arrayVal[index] = arrayVal[index] || {};
            arrayVal[index][key] = format(item[child], column.format);
          });
          result[parent] = arrayVal;
          return;
        }

        // mixed 如果指定有别名，则用别名取代JOSN路径
        if (_.isObject(val)) {
          if (isEmpty(column.alias)) {
            result[parent] = result[parent] || {};
            result[parent][key] = format(val[child], column.format);
          } else {
            result[key] = format(val[child], column.format);
          }
          return;
        }
        return;
      }

      result[column.alias || column.item] = format(data[column.item], column.format);
    }
  });

  return result;
};

