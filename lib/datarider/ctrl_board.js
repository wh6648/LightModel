/**
 * @file 存取Board的Controller
 * @author sl_say@gmail.com
 * @module light.datarider.ctrl_board
 */

"use strict";

var light           = require("light-framework")
  , errors          = light.framework.error
  , log             = light.framework.log
  , async           = light.util.async
  , _               = light.util.underscore
  , modBoard        = require("./mod_board")
  , constant        = require("../constant")
  ;

/**
 * @desc 创建Board
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回添加的Board
 */
exports.add = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid;

  log.debug("begin: add board.", uid);

  // TODO 追加check
  var newBoard= {
      appName: params.appName
    , schemaName: params.schemaName
    , key: params.key
    , name: params.name
    , type: params.type
    , advance: params.advance
    , filters: params.filters
    , selects: params.selects
    , sorts: params.sorts
    , groups: params.groups
    , additions: params.additions
    };

  // Common
  var current = new Date();
  newBoard.valid = constant.VALID;
  newBoard.createAt = current;
  newBoard.createBy = uid;
  newBoard.updateAt = current;
  newBoard.updateBy = uid;

  var condition = {
      appName: params.appName
    , schemaName: params.schemaName
    , key: params.key
    , valid: 1
    };

  modBoard.getOne(handler.code, condition, function(err, board) {
    if (err) {
      log.error(err, uid);
      callback(new errors.db.Add());
      return;
    }

    if (board) {
      callback(new errors.parameter.ParamError("Duplicate key:appName,schemaName,boardKey"));
    } else {
      modBoard.add(handler.code, newBoard, function (err, result) {
        if (err) {
          log.error(err, uid);
          return callback(new errors.db.Add());
        }

        log.debug("finished: add board.", uid);
        return callback(err, result);
      });
    }
  });

};

/**
 * @desc 删除Board
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回删除的Board
 */
exports.remove = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , bid = params.boardId;

  log.debug("begin: remove board.", uid);
  log.debug("BoardID: " + bid, uid);

  var removeBoard= {
      "updateAt": new Date()
    , "updateBy": uid
    };

  modBoard.remove(handler.code, bid, removeBoard, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Remove());
    }

    if (result) {

      log.debug("finished: remove board.", uid);
      return callback(err, result);
    } else {
      log.error(result, uid);
      return callback(new errors.db.NotExist());
    }
  });
};

/**
 * @desc 更新Board
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回更新的Board
 */
exports.update = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , bid = params.boardId;

  log.debug("begin: update Board.", uid);
  log.debug("BoardID: " + bid, uid);

  // TODO 追加check
  var updateBoard= {
      appName: params.appName
    , schemaName: params.schemaName
    , key: params.key
    , name: params.name
    , type: params.type
    , advance: params.advance
    , filters: params.filters
    , selects: params.selects
    , sorts: params.sorts
    , groups: params.groups
    , additions: params.additions
    };

  // Common
  updateBoard.updateAt = new Date();
  updateBoard.updateBy = uid;

  var condition = {
      appName: params.appName
    , schemaName: params.schemaName
    , key: params.key
    , valid: 1
    };

  modBoard.getOne(handler.code, condition, function(err, board) {
    if (err) {
      log.error(err, uid);
      callback(new errors.db.Update());
      return;
    }

    if (board && board._doc._id != bid) {
      callback(new errors.parameter.ParamError("Duplicate key:appName,schemaName,boardKey"));
    } else {
      modBoard.update(handler.code, bid, updateBoard, function(err, result) {

        if (err) {
          log.error(err, uid);
          return callback(new errors.db.Update());
        }

        if (result) {

          log.debug("finished: update board.", uid);
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
 * @param {Function} callback 回调函数，返回Board数
 */
exports.total = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , condition = params.condition;

  log.debug("begin: total board.", uid);
  log.debug("condition: " + condition, uid);

  modBoard.total(handler.code, condition, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: total board.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据BoardID,查询Board信息
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Board信息
 */
exports.get = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , bid = params.boardId;

  log.debug("begin: get board.", uid);
  log.debug("BoardID: " + bid, uid);

  return modBoard.get(handler.code, bid, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: get board.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件，检索Board信息
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Board信息
 */
exports.getOne = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , condition = params.condition;

  log.debug("begin: getOne board.", uid);

  return modBoard.getOne(handler.code, condition, function (err, result) {

    if (err) {
      log.error(err, uid);
      return callback(new errors.db.Find());
    }

    log.debug("finished: getOne board.", uid);
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Board
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Board一览
 */
exports.getList = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , code = handler.code
    , start = params.skip
    , limit = params.limit
    , condition = params.condition
    , order = params.order;

  log.debug("begin: getList board.", uid);
  log.debug("condition: " + condition, uid);
  log.debug("order: " + order, uid);

  modBoard.total(code, condition, function (err, count) {

    if (err) {
      log.error(err, uid);
      callback(new errors.db.Find());
      return;
    }

    modBoard.getList(code, condition, start, limit, order, function (err, result) {

      if (err) {
        log.error(err, uid);
        callback(new errors.db.Find());
        return;
      }

      log.debug("finished: getList board.", uid);
      callback(err, { totalItems: count, items: result });
    });

  });
};

/**
 * structure字段更新后，从新构筑board信息
 * @param handler 上下文对象
 * @param callback 回调函数
 */
exports.rebuildBoard = function(handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , code = handler.code
    , fields = [];

  // structure定义的字段，包含子项目时，暂开子项目并用[.]分隔
  _.each(params.structure.items, function(item) {
    if (item.sub && item.sub.length > 0) {
      var nest = _.map(_.pluck(item.sub, "name"), function(sub) {
        return item.key + "." + sub;
      });
      fields = _.union(fields, nest);
    } else {
      fields.push(item.key);
    }
  });

  // 更新所有关联的board
  var condition = { appName: params.appName, schemaName: params.schemaName, valid: 1 };
  modBoard.getList(code, condition, 0, Number.MAX_VALUE, null, function (err, result) {
    if (err) {
      return callback(new errors.db.Find());
    }

    async.each(result, function (board, loop) {
      var object = {};

      // 剔除被删除的字段
      _.each(["selects", "filters", "sorts", "groups"], function (key) {

        // 提出被删除的字段
        var filtered = _.reject(board[key], function (item) {
          return !_.contains(fields, item.item);
        });

        // 为了更新，删除旧_id字段
        filtered = _.map(filtered, function (item) {
          return _.omit(item._doc, "_id");
        });

        object[key] = filtered;
      });

      // 追加struct里新添加的字段，并设为非选择项
      _.each(_.difference(fields, _.pluck(board.selects, "item")), function (item) {
        object.selects.push({ item: item, format: "", alias: "", select: "0", type: "0" });
      });

      modBoard.update(code, board._id.toString(), object, function (err) {
        return loop(err);
      });
    }, callback);
  });
};

