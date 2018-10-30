/**
 * @file health check
 * @author r2space@gmail.com
 */

"use strict";

var sync      = require("async")
  , log       = require("../log")
  , constant  = require("../constant")
  , util      = require("../helper")
  , hcheck = require("../hcheck/mod_hcheck");

/**
 *
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回添加的公司
 * @returns {*} 无
 */
exports.check = function(handler, callback) {

  log.debug("begin: health check.", handler.uid);

  var tasks = {};

  // 检查数据库
  tasks.checkDB = function(done) {

    hcheck.check(handler.code, function(err) {
      if (err) {
        log.error(err, handler.uid);
        return done(undefined, constant.STATUS_NG);
      }

      return done(err,  constant.STATUS_OK);
    });
  };

  // 检查缓存服务器
  tasks.checkCache = function(done) {
    return done(undefined, constant.STATUS_UNKNOWN);
  };

  // 检查MQ
  tasks.checkMq = function(done) {
    return done(undefined, constant.STATUS_UNKNOWN);
  };

  // 并行执行任务
  sync.parallel(tasks, function(err, result) {

    var status = util.applicationInfo();

    status.db = result.checkDB;
    status.cache = result.checkCache;
    status.mq = result.checkMq;

    log.debug("finished: health check.", handler.uid);
    return callback(err, status);
  });

};
