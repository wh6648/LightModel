/**
 * @file 存取数据的Controller
 * @author r2space@gmail.com
 * @module light.datarider.ctrl_data
 */

"use strict";

var light           = require("light-framework")
  , async           = light.util.async
  , errors          = light.framework.error
  , log             = light.framework.log
  , modData         = require("./mod_data")
  , helper          = require("./helper_structure");

/**
 * @desc 添加Data
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  data: {
 *    title: "Hello"
 *    body: "Welcome to the Data Store"
 *  }
 * @param {Function} callback 回调函数，返回添加的Data
 */
exports.add = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  // 获取数据定义
  var getDataStructure = function(done) {
    helper.findStructureInfo(handler, function(err, result) {
      err = helper.isLocked(result) ? new errors.db.Locked() : err;
      done(err, result);
    });
  };

  // 设定值
  var createDataObject = function(schema, done) {
    done(undefined, schema, helper.createDataByStructure(uid, schema, true, params.data));
  };

  // 遍历items
  var checkDataIsValid = function(schema, data, done) {
    helper.checkDataByStructure(schema, data, true, function(err) {
      done(err, data);
    });
  };

  // 添加数据
  var addDataToCollection = function(data, done) {
    modData.add(handler.code, schemaName, data, function(err, result) {
      if (err) {
        log.error(err, uid);
        done(new errors.db.Add());
        return;
      }

      done(err, result);
    });
  };

  async.waterfall([getDataStructure, createDataObject, checkDataIsValid, addDataToCollection], function(err, result) {
    return callback(err, result);
  });

};

/**
 * @desc 删除Data
 * @param {Object} handler 上下文对象
 * Exp.
 *  schemaName: "Message"
 *  did: "530b62f829c354b84d9a38b2"
 * @param {Function} callback 回调函数，返回删除的Data
 */
exports.remove = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  // 检查是否被锁定
  var getDataStructure = function(done) {
    helper.findStructureInfo(handler, function(err, result) {
      err = helper.isLocked(result) ? new errors.db.Locked() : err;
      done(err);
    });
  };

  var removeData = function(done) {
    var removeData = {
        "updateAt": new Date()
      , "updateBy": uid
      , "valid": 0
      };

    modData.upsert(handler.code, schemaName, params.filter, removeData, { upsert: false }, function(err, result) {

      if (err) {
        log.error(err, uid);
        return done(new errors.db.Remove());
      }

      if (result) {
        return done(err, result);
      } else {
        log.error(result, uid);
        return done(new errors.db.NotExist());
      }
    });
  };

  async.waterfall([getDataStructure, removeData], function(err, result) {
    return callback(err, result);
  });

};

/**
 * @desc 更新Data
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  filter: { id: "530b62f829c354b84d9a38b2" }
 *  data: {
 *    title: "Hello"
 *    body: "Welcome to the Data Store"
 *  }
 * @param {Function} callback 回调函数，返回更新的Data
 */
exports.update = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  // 获取数据定义
  var getDataStructure = function(done) {
    helper.findStructureInfo(handler, function(err, result) {
      err = helper.isLocked(result) ? new errors.db.Locked() : err;
      done(err, result);
    });
  };

  // 设定值
  var createDataObject = function(schema, done) {
    done(undefined, schema, helper.createDataByStructure(uid, schema, false, params.data));
  };

  // 遍历items
  var checkDataIsValid = function(schema, data, done) {
    helper.checkDataByStructure(schema, data, false, function(err) {
      done(err, data);
    });
  };

  // 更新数据
  var updateCollectionData = function(data, done) {
    modData.update(handler.code, schemaName, params.filter, data, function(err, result) {
      if (err) {
        log.error(err, uid);
        return done(new errors.db.Update());
      }

      if (result) {
        return done(err, result);
      } else {

        log.error(result, uid);
        return done(new errors.db.NotExist());
      }
    });
  };

  async.waterfall([getDataStructure, createDataObject, checkDataIsValid, updateCollectionData], function(err, result) {
    return callback(err, result);
  });

};

/**
 * @desc 更新Data
 *  新规时，需要从定义中获取缺省值，所以需要先进行查询。
 *  TODO: $inc
 * @param {Object} handler 上下文对象
 * Exp.
 *  appName: "app1"
 *  schemaName: "Message"
 *  condition: {messageId:"",uId:""}
 *  data: {
 *    title: "Hello"
 *    body: "Welcome to the Data Store"
 *  }
 * @param {Function} callback 回调函数，返回更新件数
 */
exports.upsert = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  // 获取数据定义
  var getDataStructure = function(done) {
    helper.findStructureInfo(handler, function(err, result) {
      err = helper.isLocked(result) ? new errors.db.Locked() : err;
      done(err, result);
    });
  };

  // 判断是否是新规
  var checkExist = function(schema, done) {
    handler.addParams("filter", handler.params.data);
    exports.getOne(handler, function(err, isExist) {
      done(err, schema, isExist);
    });
  };

  // 遍历items
  var checkDataIsValid = function(schema, isExist, done) {
    helper.checkDataByStructure(schema, params.data, !isExist, function(err) {
      done(err, schema, isExist);
    });
  };

  // 设定值
  var createDataObject = function(schema, isExist, done) {
    done(undefined, helper.createDataByStructure(uid, schema, !isExist, params.data));
  };

  // 更新数据
  var updateCollectionData = function(updateData, done) {
    modData.upsert(handler.code, schemaName, params.filter, updateData, null, function(err, result) {
      if (err) {
        log.error(err, uid);
        return done(new errors.db.Update());
      }

      if (result) {
        return done(err, result);
      }
    });
  };

  async.waterfall([getDataStructure, checkExist, checkDataIsValid, createDataObject, updateCollectionData]
    , function(err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据DataID,查询Data信息
 * @param {Object} handler 上下文对象
 * Exp.
 *  schemaName: "Message"
 *  filter: { id: "530b62f829c354b84d9a38b2" }
 * @param {Function} callback 回调函数，返回Data信息
 */
exports.get = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  return modData.get(handler.code, schemaName, params.filter.id, params.select, function(err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件，检索Data信息
 * @param {Object} handler 上下文对象
 * Exp.
 *  schemaName: "Message"
 *  filter: { field: "mycondition" }
 * @param {Function} callback 回调函数，返回Data信息
 */
exports.getOne = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName
    , filter = params.filter
    , select = params.select;

  return modData.getOne(handler.code, schemaName, filter, select, function(err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Data
 * Exp.
 *  schemaName: "Message"
 *  filter: {field: "mycondition"}
 *  select: "field1 field2"
 *  skip: 0
 *  limit: 10
 *  sort: {field: desc}
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Data一览
 */
exports.getList = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , code = handler.code
    , schemaName = params.schemaName
    , filter = params.filter
    , select = params.select
    , skip = params.skip
    , limit = params.limit
    , sort = params.sort;

  modData.total(code, schemaName, filter, function(err, count) {

    if (err) {
      log.error(err, uid);
      callback(new errors.db.Find());
      return;
    }

    modData.getList(code, schemaName, filter, select, skip, limit, sort, function(err, result) {

      if (err) {
        log.error(err, uid);
        callback(new errors.db.Find());
        return;
      }

      callback(err, { totalItems: count, items: result });
    });
  });
};

/**
 * @desc 统计符合条件的件数
 * @param {Object} handler 上下文对象
 * Exp.
 *  schemaName: "Message"
 *  filter: {field: "mycondition"}
 * @param {Function} callback 回调函数，返回Data数
 */
exports.total = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , schemaName = params.schemaName;

  log.debug("begin: total data.", uid);

  modData.total(handler.code, schemaName, params.filter, function(err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: total data.", uid);
    return callback(err, result);
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
    , code = handler.code
    , schemaName = params.schemaName;

  log.debug("begin: distinct data.", uid);

  return modData.distinct(code, schemaName, params.select, params.filter, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: distinct data.", uid);
    return callback(err, result);
  });
};

/**
 * 集合操作
 * @param {Object} handler 上下文对象
 * Exp.
 *  schemaName: "Message"
 *  filter: { field: "mycondition" }
 *  group: { $sum: "$field" }
 * @param {Function} callback 回调函数，返回Data一览
 */
exports.aggregate = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , code = handler.code
    , schemaName = params.schemaName
    , filter = params.filter
    , group = params.group;

  log.debug("begin: aggregate.", uid);

  modData.aggregate(code, schemaName, filter, group, function(err, result) {
    if (err) {
      log.error(err, uid);
      callback(new errors.db.Find());
      return;
    }

    log.debug("finished: aggregate.", uid);
    callback(err, result[0]);
  });
};
