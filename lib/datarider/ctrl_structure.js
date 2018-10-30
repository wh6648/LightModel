/**
 * @file 存取数据结构的Controller
 * @author r2space@gmail.com
 * @module light.datarider.ctrl_structure
 */

"use strict";

var light           = require("light-framework")
  , _               = light.util.underscore
  , errors          = light.framework.error
  , log             = light.framework.log
  , modStructure    = require("./mod_structure")
  , ctrl_board      = require("./ctrl_board")
  , mobile          = require("./helper_mobile")
  , constant        = require("../constant")
  ;

/**
 * @desc 创建Structure
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回添加的Structure
 */
exports.add = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid;

  log.debug("begin: add structure.", uid);

  // TODO:数据check

  var newStructure = {
      public: params.public
    , lock: params.lock
    , version: params.version
    , appName: params.appName
    , schemaName: params.schemaName
    , items: params.items
    };

  // Common
  var current = new Date();
  newStructure.valid = constant.VALID;
  newStructure.createAt = current;
  newStructure.createBy = uid;
  newStructure.updateAt = current;
  newStructure.updateBy = uid;

  var condition = {
    appName: params.appName
  , schemaName: params.schemaName
  , valid: 1
  };

  modStructure.getOne(handler.code, condition, function(err, stru) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Add());
    }

    if (stru) {
      return callback(new errors.parameter.ParamError("Duplicate key:appName,schemaName"));
    } else {
      modStructure.add(handler.code, newStructure, function (err, result) {
        if (err) {
          log.error(err, uid);
          return callback(new errors.db.Add());
        }

        log.debug("finished: add structure.", uid);
        return callback(err, result);
      });
    }
  });
};

/**
 * @desc 删除Structure
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回删除的Structure
 */
exports.remove = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , sid = params.sid;

  log.debug("begin: remove structure.", uid);
  log.debug("StructureID: " + sid, uid);

  var removeStructure = {
      "updateAt": new Date()
    , "updateBy": uid
    };

  modStructure.remove(handler.code, sid, removeStructure, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Remove());
    }

    if (result) {

      log.debug("finished: remove structure.", uid);
      return callback(err, result);
    } else {
      log.error(result, uid);
      return callback(new errors.db.NotExist());
    }
  });
};

/**
 * @desc 更新Structure
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回更新的Structure
 */
exports.update = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , sid = params.sid;

  log.debug("begin: update Structure.", uid);
  log.debug("StructureID: " + sid, uid);

  // TODO:数据check

  var updateStructure = {
      public: params.public
    , lock: params.lock
    , version: params.version
    , appName: params.appName
    , schemaName: params.schemaName
    , items: params.items
    };

  // Common
  updateStructure.updateAt = new Date();
  updateStructure.updateBy = uid;

  var condition = {
      appName: params.appName
    , schemaName: params.schemaName
    , valid: 1
    };

  modStructure.getOne(handler.code, condition, function(err, stru) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Update());
    }

    if (stru && stru._doc._id.toString() !== sid) {
      return callback(new errors.parameter.ParamError("Duplicate key:appName,schemaName"));
    } else {
      modStructure.update(handler.code, sid, updateStructure, function(err, result) {

        if (err) {
          log.error(err, uid);
          return callback(new errors.db.Update());
        }

        if (result) {

          log.debug("finished: update structure.", uid);
          return callback(err, result);
        } else {
          log.error(result, uid);
          return callback(new errors.db.NotExist());
        }
      });
    }
  });
};

/**
 * @desc 统计符合条件的件数
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Structure数
 */
exports.total = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , condition = params.condition;

  log.debug("begin: total structure.", uid);
  log.debug("condition: " + condition, uid);

  modStructure.total(handler.code, condition, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: total structure.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据StructureID,查询Structure信息
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Structure信息
 */
exports.get = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , sid = params.sid;

  log.debug("begin: get structure.", uid);
  log.debug("StructureID: " + sid, uid);

  return modStructure.get(handler.code, sid, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: get structure.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件，检索Structure信息
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Structure信息
 */
exports.getOne = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , condition = params.condition;

  return modStructure.getOne(handler.code, condition, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: getOne structure.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Structure
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Structure一览
 */
exports.getList = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , code = handler.code
    , start = params.skip
    , limit = params.limit
    , condition = params.condition
    , order = params.order;

  log.debug("begin: getList structure.", uid);
  log.debug("condition: " + condition, uid);
  log.debug("order: " + order, uid);

  modStructure.total(code, condition, function (err, count) {

    if (err) {
      log.error(err, uid);
      callback(new errors.db.Find());
      return;
    }

    modStructure.getList(code, condition, start, limit, order, function (err, result) {

      if (err) {
        log.error(err, uid);
        callback(new errors.db.Find());
        return;
      }

      log.debug("finished: getList structure.", uid);
      return callback(err, { totalItems: count, items: result });
    });

  });
};

/**
 * @desc 查询符合条件的文档并返回根据键分组的结果
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Distinct结果
 */
exports.distinct = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , field = params.field
    , condition = params.condition;

  log.debug("begin: distinct structure.", uid);
  log.debug("field: " + field, uid);
  log.debug("condition: " + JSON.stringify(condition), uid);

  return modStructure.distinct(handler.code, field, condition, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: distinct structure.", uid);
    return callback(err, result);
  });

};

/**
 * @desc 获取schema一览
 * @param handler
 * @param callback
 */
exports.getSchemas = function(handler, callback) {

  var uid = handler.uid;

  log.debug("begin: getSchemas.", uid);
  modStructure.getList(handler.code, {}, 0, Number.MAX_VALUE, "", function (err, result) {

    if (err) {
      log.error(err, uid);
      callback(new errors.db.Find());
      return;
    }

    var schemas = [];
    _.each(result, function(row) {
      schemas.push(row.schemaName);
    });

    log.debug("finished: getSchemas.", uid);
    return callback(err, schemas);
  });

};

exports.getMobileFile = function(handler, callback) {
  exports.getList(handler,function(err,result){
    if(err){
      callback(err);
    }
    ctrl_board.getList(handler,function(err,boardResult){
      callback(err, mobile.getFileContent(result.items, boardResult.items));
    });

  });

};

