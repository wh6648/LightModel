/**
 * @file 国际化（internationalization）
 * @author r2space@gmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , util      = light.lang.util
  , context   = light.framework.context
  , log       = light.framework.log
  , company   = require("./ctrl_company")
  ;

var cache = {};


/**
 * 初始化缓存
 * 从数据库读取所有内容，并加载到内存
 * @param {Object} req 请求
 * @param {Function} callback 返回缓存的内容
 */
exports.init = function (req, callback) {

  if (_.isEmpty(cache) === true) {

    var handler = new context().bind(req);
    handler.addParams("condition", { valid: 1 });
    handler.addParams("limit", Number.MAX_VALUE);

    log.info("initialize multiTenant", undefined);

    company.getList(handler, function(err, result){
      if (err) {
        log.error(err, handler.uid);
        return callback(err);
      }

      _.each(result.items, function (row) {
        cache[row.domain] = row.code;
      });

      callback(err);
    });

  } else {
    callback(cache);
  }
};

/**
 * 更新公司缓存
 * @param {String} domain 公司Domain
 * @param {String} code   公司Code
 */
exports.update = function (domain, code) {

  log.debug(util.format("multiTenant cache updated. domain:%s value:%s", domain, code), undefined);

  // 更新
  for (var key in cache){
    if (code === cache[key]) {
      delete cache[key];
      break;
    }
  }

  cache[domain] = code;
  console.log(cache);
};

/**
 * 设定公司code
 * @param {Object} req 请求
 */
exports.setTenantCode = function (req) {

  var host  = req.headers.host || "";
  var parts = host.split(/\./);
  if (parts[0]) {

    req.session.code = cache[parts[0]] || "";
    log.debug(util.format("multiTenant code seted. key:%s", req.session.code), undefined);
  }
};