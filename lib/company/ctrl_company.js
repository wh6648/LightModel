/**
 * @file 存取组信息的controller
 * @author r2space@gmail.com
 */

"use strict";

var light       = require("light-framework")
  , sync        = light.util.async
  , errors      = light.framework.error
  , log         = light.framework.log
  , multiTenant = require("./multiTenant")
  , company     = require("./mod_company");

/**
 * 添加公司
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回添加的公司
 * @returns {*} 无
 */
exports.add = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid;

  log.debug("begin: add company.", uid);
  log.debug("company name: " + params.name, uid);
  log.debug("company domain: " + params.domain, uid);

  var comp = {};
  comp.name = params.name;
  comp.domain = params.domain;
  comp.type = params.type;

  if (params.extend) {
    comp.extend = params.extend;
  }

  comp.createAt = new Date();
  comp.createBy = uid;
  comp.updateAt = comp.createAt;
  comp.updateBy = uid;

  sync.waterfall([

    // 检查domain的唯一性
    function (done) {

      // 检查domain是否已经存在
      company.getByDomain(comp.domain, function (err, result) {
        if (err) {
          log.error(err, uid);
          return done(new errors.InternalServer(__(handler, "js.ctr.common.system.error")));
        }

        if (result) {
          log.error(result, uid);
          return done(new errors.BadRequest(__(handler, "js.ctr.check.company.domain")));
        }

        return done();
      });
    },

    // 添加公司
    function (done) {

      company.add(comp, function (err, result) {
        if (err) {
          log.error(err, uid);
          return  done(new errors.InternalServer(__(handler, "js.ctr.common.system.error")));
        }

        // 更新多客户缓存
        multiTenant.update(result.domain, result.code);

        return done(err, result._doc);
      });
    }

  ], function (err, result) {

    log.debug("finished: add company.", uid);
    return callback(err, result);
  });
};

/**
 * 获取公司一览
 * @param handler
 * @param callback
 */
exports.getList = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid
    , start = params.start
    , limit = params.limit
    , condition = params.condition
    , order = params.order;

  // 获取件数
  company.total(condition, function (err, count) {
    if (err) {
      log.error(err, uid);
      callback(new errors.InternalServer(err));
      return;
    }

    // 获取一览
    company.getList(condition, start, limit, order, function (err, result) {
      if (err) {
        log.error(err, uid);
        return callback(new errors.InternalServer(err));
      }

      return callback(err, { totalItems: count, items: result });
    });
  });
};

/**
 * 获取公司一览, 用关键字模糊检索
 * @param handler
 * @param callback
 */
exports.getListByKeyword = function (handler, callback) {

  var params = handler.params
    , keyword = params.keyword;

  if (keyword) {
    params.addParams("$or", [
      { "name": new RegExp(keyword.toLowerCase(), "i") }
    ]);
  }

  exports.getList(handler, callback);
};

/**
 * 更新指定公司
 * @param handler
 * @param callback
 */
exports.update = function (handler, callback) {

  var params = handler.params
    , uid = handler.uid;

  log.debug("begin: update company.", uid);
  log.debug("company id: " + params.cid, uid);
  log.debug("company domain: " + params.domain, uid);

  var comp = {};
  comp.name = params.name;
  comp.domain = params.domain;
  comp.type = params.type;

  if (params.extend) {
    comp.extend = params.extend;
  }

  comp.updateAt = new Date();
  comp.updateBy = uid;

  // 如果编辑画面的domain变更时，进行domain check，防止变更为成已经存在的其他公司。
  company.getByDomain(comp.domain, function (err, compResult) {

    if (err) {
      log.error(err, uid);
      return  callback(new errors.InternalServer(__(handler, "js.ctr.common.system.error")));
    }

    if (compResult && (compResult._doc._id != params.cid)) {

      return callback(new errors.BadRequest(__(handler, "js.ctr.check.company.path")));
    } else {
      company.update(params.cid, comp, function (err, result) {

        if (err) {
          log.error(err, uid);
          return callback(new errors.InternalServer(err));
        }

        // 多客户缓存更新
        multiTenant.update(result.domain, result.code);

        log.debug("finished: update company.", uid);
        return callback(err, result);
      });
    }
  });

};


/**
 * 通过公司ID获取指定公司
 * @param handler
 * @param callback
 */
exports.getByDomain = function (handler, callback) {

  var params = handler.params
    , domain = params.domain
    , uid = handler.uid;

  log.debug("begin: getByDomain.", uid);
  log.debug("company domain: " + domain, uid);

  company.getByDomain(domain, function (err, result) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.InternalServer(err));
    } else {
      log.debug(result, uid);
      log.debug("finished: getByDomain.", uid);
      return callback(err, result);
    }
  });

};

/**
 * 通过公司Code获取指定公司
 * @param handler
 * @param callback
 */
exports.getByCode = function (handler, callback) {

  var params = handler.params
    , code = params.code
    , uid = handler.uid;

  log.debug("begin: getByCode.", uid);
  log.debug("company code: " + code, uid);

  company.getByCode(code, function (err, result) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.InternalServer(err));
    } else {
      log.debug(result, uid);
      log.debug("finished: getByCode.", uid);
      return callback(err, result);
    }
  });
};

/**
 * 通过公司Id获取指定公司
 * @param handler
 * @param callback
 */
exports.get = function (handler, callback) {

  var params = handler.params
    , cid = params.cid
    , uid = handler.uid;

  log.debug("begin: get", uid);
  log.debug("company id: " + cid, uid);

  company.get(cid, function (err, result) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.InternalServer(err));
    } else {
      log.debug(result, uid);
      log.debug("finished: get.", uid);
      return callback(err, result);
    }
  });
};

exports.schema = function() {
  return company.schema();
};
