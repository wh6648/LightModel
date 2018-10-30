/**
 * @file Structure的帮助类
 * @author r2space@gmail.com
 */

"use strict";

var light           = require("light-framework")
  , _               = light.util.underscore
  , context         = light.framework.context
  , errors          = light.framework.error
  , log             = light.framework.log
  , validator       = light.framework.validator
  , cache           = light.framework.cache
  , struct          = require("./ctrl_structure")
  , constant        = require("../constant")
  , type            = require("../type")
  , string          = require("../type/string")
  , number          = require("../type/number")
  , date            = require("../type/date")
  , boolean         = require("../type/boolean")
  , objectid        = require("../type/objectid")
  , array           = require("../type/array")
  , mixed           = require("../type/mixed")
  ;

/**
 * 缺省的类型校验
 * @param type 类型名
 * @param key 字段名称
 * @returns {*}
 */
function getDefaultRule(type, key) {
  var rules = {
      String: string.validator(key)
    , Number: number.validator(key)
    , Date: date.validator(key)
    , Boolean: boolean.validator(key)
    , ObjectID: objectid.validator(key)
    , Array: array.validator(key)
    , Mixed: mixed.validator(key)
    };

  return rules[type];
}

// TODO: 缓存数据结构
// TODO: 校验错误多国语言对应
// TODO: 添加全文检索

// 添加索引
exports.addIndex = function() {

};

// 获取索引
exports.getIndexs = function() {

};

/**
 * 公开，非公开
 * @param schema
 * @returns {boolean}
 */
exports.isPublic = function(schema) {
  return schema && schema.public === 1;
};

/**
 * 锁定
 * @param schema
 * @returns {boolean}
 */
exports.isLocked = function(schema) {
  return schema && schema.lock === 1;
};

/**
 * 获取系统使用的，预约的字段名称
 * @returns {string[]}
 */
exports.getReservedField = function() {
  return [
    "_id"
  , "valid"
  , "createAt"
  , "createBy"
  , "updateAt"
  , "updateBy"
  , "parent"
  , "version"
  , "structure"
  , "board"
  ];
};

exports.getCommonField = function() {
  return [
    "_id"
  , "valid"
  , "createAt"
  , "createBy"
  , "updateAt"
  , "updateBy"
  ];
};

exports.getTypes = function() {
  return [
    string.type
  , number.type
  , date.type
  , array.type
  , mixed.type
  , boolean.type
  , objectid.type
  ];
};

/**
 * 获取collection的定义
 * params:
 *   appName
 *   schemaName
 * @param handler
 * @param callback
 */
exports.findStructureInfo = function(handler, callback) {

  var params = handler.params
    , condition = {
      valid: 1
    };

  if (params.appName) {
    condition.appName = params.appName
  }

  if (params.schemaName) {
    condition.schemaName = params.schemaName
  }

  // 尝试从缓存里取值
  var structure = cache.get(condition.appName, condition.schemaName);
  if (structure) {
    callback(undefined, structure);
    return;
  }

  var newHandler = new context().create(params.uid, handler.code, handler.lang);
  newHandler.addParams("condition", condition);

  struct.getOne(newHandler, function(err, result) {
    if (err) {
      log.error(err, params.uid);
      callback(new errors.db.Find(null));
      return;
    }

    if (!result) {
      callback(new errors.db.NotExist(null));
      return;
    }

    cache.set(condition.appName, condition.schemaName, result)
    callback(err, result);
  });
};

/**
 * 进行数据校验
 * @param schema collection的定义
 * @param data 数据
 * @param strict 更新:false(不检查require)，新规:true
 * @param callback
 */
exports.checkDataByStructure = function(schema, data, strict, callback) {

  var error = [];
  if (schema && schema.items) {

    _.each(schema.items, function(item) {
      if (item.reserved === 1) {
        return;
      }
      if (_.isNull(data[item.key])) {
        return;
      }

      var itemRules = strict ? item.validator
        : _.reject(item.validator, function(item) { return item.rule[0] === "isRequired"; });

      var rules = _.union(itemRules, getDefaultRule(item.type, item.key));
      if (rules && rules.length > 0) {
        error = _.union(error, validator.isValid(data, rules));
      }
    });
  }

  if (error && error.length > 0) {
    var errmsg = "The field " + error[0].name + " " + error[0].message;
    callback(new errors.parameter.ParamError(errmsg));
    return;
  }

  callback(undefined);
};

/**
 * 按照collection的定义创建数据对象
 * @param uid
 * @param schema
 * @param isNew
 * @param data
 * @returns {{}}
 */
exports.createDataByStructure = function(uid, schema, isNew, data) {
  var newData = {}
    , current = new Date();

  // 创建日时
  newData.updateAt = current;
  newData.updateBy = uid;
  if (isNew) {
    newData.valid = constant.VALID;
    newData.createAt = current;
    newData.createBy = uid;
  }

  if (schema && schema.items) {
    _.each(schema.items, function(item) {
      if(item.key === "_id"){
        return;
      }
      if (isNew) {

        // 设定缺省值(只有新规 且 没有指定值时设定)
        if (_.isUndefined(data[item.key])) {
          if (!_.str.isBlank(item.default)) {
            newData[item.key] = type.parse(item.type, item.default);
          }
        } else {
          newData[item.key] = type.parse(item.type, data[item.key]);
        }
      } else {
        if (!_.isUndefined(data[item.key])) {
          newData[item.key] = type.parse(item.type, data[item.key]);
        }
      }
    });
  }
  return newData;
};
