/**
 * @file datastore的控制
 * @author r2space@gmail.com
 */

"use strict";

var light           = require("light-framework")
  , async           = light.util.async
  , _               = light.util.underscore
  , context         = light.framework.context
  , errors          = light.framework.error
  , log             = light.framework.log
  , filter          = require("./operation/filter")
  , group           = require("./operation/group")
  , helper          = require("./helper_board")
  , helperStructure = require("./helper_structure")
  , data            = require("./ctrl_data")
  , type            = require("../type")
  ;

/**
 *
 * @param handler
 * @param define
 * @param items
 * @param data
 * @param callback
 */
function appendOptions(handler, define, items, data, callback) {
  type.getOption(handler, define, items, function(err, option) {
    data.options = option;
    callback(err, data);
  });
}

/**
 * @desc 添加Data
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  data: {
 *    title: "Hello"
 *    body: "Welcome to the Data Store"
 *  }
 * @param {Function} callback 回调函数，返回添加的Data
 */
exports.add = function(handler, callback) {

  log.debug("begin: add data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helper.findBoardInfo(handler, function(err, define) {
      done(err, define);
    });
  };

  // 添加数据
  var callDataCtrl = function(define, done) {
    data.add(handler, function(err, result) {
      done(err, helper.reject(result._doc, define));
    });
  };

  async.waterfall([getBoard, callDataCtrl], function(err, result) {
    log.debug("finished: add data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Data
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  boardName: "DefaultList"
 *  skip: 0
 *  limit: 20
 *  filter: { title1: "Hello" }
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Data一览
 */
exports.getList = function(handler, callback) {

  log.debug("begin: getList data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      helper.findBoardInfo(handler, function(err, define) {
        define.struct = schema.items; // 获取schema，目的是确定项目类型，进行比较时转换类型
        done(err, define);
      });
    });
  };

  // 前调函数
  var beforeTrigger = function(define, done) {
    helper.beforeTrigger(define, handler, function(err) {
      done(err, define, {});
    });
  };

  // 获取数据
  var callDataCtrl = function(define, condition, done) {
    handler.addParams("filter", helper.getFilter(define, handler));
    handler.addParams("sort", helper.getSort(define, handler.params.sort));
    data.getList(handler, function (err, result) {
      done(err, define, result);
    });
  };

  // 后调函数
  var afterTrigger = function(define, result, done) {
    helper.afterTrigger(define, result, function(err, result) {
      done(err, define, result);
    });
  };

  // 获取附加项
  var addOption = function(define, result, done) {

    // set format & alias ...
    var items = [];
    _.each(result.items, function(item) {
      items.push(helper.reject(item._doc, define));
    });
    result.items = items;
    appendOptions(handler, define, items, result, done);
  };

  async.waterfall([getBoard, beforeTrigger, callDataCtrl, afterTrigger, addOption], function(err, result) {
    log.debug("finished: getList data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 使用指定的ID获取数据
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  id: "530b6d653765c8bd4eff84ac"
 * @param {Function} callback 回调函数，返回对象数据
 * @returns {*}
 */
exports.get = function(handler, callback) {

  log.debug("begin: get data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helper.findBoardInfo(handler, function(err, define) {
      done(err, define);
    });
  };

  // 前调函数
  var beforeTrigger = function(define, done) {
    helper.beforeTrigger(define, handler, function(err) {
      done(err, define);
    });
  };

  // 添加数据
  var callDataCtrl = function(define, done) {
    handler.addParams("filter", { id: handler.params.filter && handler.params.filter.id || handler.params.id });
    data.get(handler, function(err, result) {
      done(err, define, result);
    });
  };

  // 后调函数
  var afterTrigger = function(define, result, done) {
    helper.afterTrigger(define, result, function(err, result) {
      done(err, define, result);
    });
  };

  // 获取附加项
  var addOption = function(define, result, done) {
    if (result) {
      var newResult = helper.reject(result._doc, define);
      appendOptions(handler, define, newResult, newResult, done);
    } else {
      done();
    }
  };

  async.waterfall([getBoard, beforeTrigger, callDataCtrl, afterTrigger, addOption], function(err, result) {
    log.debug("finished: get data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 指定条件获取一条数据
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  title: "mytitle"
 * @param {Function} callback 回调函数，返回对象数据
 * @returns {*}
 */
exports.getOne = function(handler, callback) {

  log.debug("begin: getOne data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      helper.findBoardInfo(handler, function(err, define) {
        define.struct = schema.items; // 获取schema，目的是确定项目类型，进行比较时转换类型
        done(err, define);
      });
    });
  };

  // 获取数据
  var callDataCtrl = function(define, done) {
    handler.addParams("filter", helper.getFilter(define, handler));
    data.getOne(handler, function(err, result) {
      done(err, define, result);
    });
  };

  // 获取附加项
  var addOption = function(define, result, done) {
    if (result) {
      var newResult = helper.reject(result._doc, define);
      appendOptions(handler, define, newResult, newResult, done);
    } else {
      done();
    }
  };

  async.waterfall([getBoard, callDataCtrl, addOption], function(err, result) {
    log.debug("finished: getOne data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 更新数据
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  data: { title: "newValue" }
 * @param {Function} callback 回调函数，返回更新的数据
 * @returns {*}
 */
exports.update = function(handler, callback) {

  log.debug("begin: update data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      helper.findBoardInfo(handler, function(err, define) {
        define.struct = schema.items;
        done(err, define);
      });
    });
  };

  // 添加数据
  var callDataCtrl = function(define, done) {
    handler.addParams("filter", helper.getFilter(define, handler));
    data.update(handler, function(err, result) {
      if (err) {
        done(err);
        return;
      }

      done(err, helper.reject(result._doc, define));
    });
  };

  async.waterfall([getBoard, callDataCtrl], function(err, result) {
    log.debug("finished: update data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 更新数据，如果没有则新规生成
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  filter: { did: "530b6d653765c8bd4eff84ac" }
 *  data: { title: "newValue" }
 * @param {Function} callback 回调函数，返回更新的件数
 * @returns {*}
 */
exports.upsert = function(handler, callback) {

  log.debug("begin: upsert data.", handler.uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      helper.findBoardInfo(handler, function(err, define) {
        define.struct = schema.items;
        done(err, define);
      });
    });
  };

  // 添加数据
  var callDataCtrl = function(define, done) {
    handler.addParams("filter", helper.getFilter(define,handler));
    data.upsert(handler, function(err, result) {
      done(err, result);
    });
  };

  async.waterfall([getBoard, callDataCtrl], function(err, result) {
    log.debug("finished: upsert data.", handler.uid);
    return callback(err, result);
  });
};

/**
 * @desc 使用指定的ID删除数据
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  board: "DefaultList"
 *  filter: { id: "530b6d653765c8bd4eff84ac" }
 * @param {Function} callback 回调函数
 * @returns {*}
 */
exports.remove = function(handler, callback) {

  log.debug("begin: remove data.", handler.uid);

  var getBoard = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      helper.findBoardInfo(handler, function(err, define) {
        define.struct = schema.items;
        done(err, define);
      });
    });
  };

  var callDataCtrl = function(define, done) {
    handler.addParams("filter", helper.getFilter(define, handler));
    data.remove(handler, function (err, result) {
      done(err, result);
    });
  };

  async.waterfall([getBoard, callDataCtrl], function(err, result) {
    log.debug("finished: remove data.", handler.uid);
    return callback(err, result);
  });
};

exports.aggregate = function(handler, callback) {
  var params = handler.params
    , uid = handler.uid
    , appName = params.appName
    , schemaName = params.schemaName
    , boardName = params.boardName;

  log.debug("begin: aggregate.", uid);
  log.debug("appName: " + appName, uid);
  log.debug("schemaName: " + schemaName, uid);
  log.debug("boardName: " + boardName, uid);

  // 获取Board数据定义
  var getBoard = function(done) {
    exports.findBoardInfo(handler, function(err, define) {
      done(err, define, {});
    });
  };

  // 指定检索条件
  var createFilter = function(define, condition, done) {
    condition.filter = helper.getFilter(define, handler);
    done(undefined, define, condition);
  };

  // 指定集合操作
  var createGroup = function(define, condition, done) {
    var result = {};
    _.each(define.groups, function(group) {
      if (group.operator === "$count") {
        // 求件数时，计算1的合计
        result[group.operator] = 1;
      } else {
        // 集合操作时，字段前要加$符号
        result[group.operator] = "$" + group.item;
      }
    });

    condition.group = result;
    done(undefined, define, condition);
  };

  // 获取数据
  var callDataCtrl = function(define, condition, done) {

    var newHandler = new context().create(uid, handler.code, handler.lang);
    newHandler.addParams("appName", appName);
    newHandler.addParams("schemaName", schemaName);
    newHandler.addParams("filter", condition.filter);
    newHandler.addParams("group", condition.group);

    // 获取数据
    data.aggregate(newHandler, function (err, result) {

      if (err) {
        log.error(err, uid);
        done(new errors.db.Find());
        return;
      }

      log.debug("finished: aggregate.", uid);
      done(err, result);
    });
  };

  async.waterfall([getBoard, createFilter, createGroup, callDataCtrl], function(err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Data
 * TODO: 确认-管理画面显示数据用？
 * Exp.
 *  schemaName: "Message"
 *  skip: 0
 *  limit: 20         - 取值件数
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Data一览
 */
exports.getAll = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  log.debug("begin: getAll data.", uid);
  log.debug("schemaName: " + schemaName, uid);
  log.debug("skip: " + params.skip, uid);
  log.debug("limit: " + params.limit, uid);

  // 获取数据
  data.getList(handler, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: getAll data.", uid);
    return callback(err, result);
  });
};

/**
 * 根据structure定义创建对象
 * @param handler
 * @param callback
 */
exports.createExtendObject = function(handler, callback) {

  var getDataStructure = function(done) {
    helperStructure.findStructureInfo(handler, function(err, schema) {
      done(undefined, schema);
    });
  };

  var createDataObject = function(schema, done) {
    var data = helperStructure.createDataByStructure(handler.uid, schema, true, handler.params.data.extend);
    done(undefined, schema, data);
  };

  var checkDataIsValid = function(schema, data, done) {
    helperStructure.checkDataByStructure(schema, data, true, function(err) {
      done(err, data);
    });
  };

  async.waterfall([getDataStructure, createDataObject, checkDataIsValid], function(err, result) {
    if (!err && result) {
      delete result.createAt;
      delete result.createBy;
      delete result.updateAt;
      delete result.updateBy;
      delete result.valid;
    }
    return callback(err, result);
  });
};

exports.getComparison = function() {
  return filter.getComparison();
};

exports.getGroupOperation = function() {
  return group.getGroupOperation();
};

exports.getReservedField = function() {
  return helperStructure.getReservedField();
};

exports.getCommonField = function() {
  return helperStructure.getCommonField();
};
