/**
 * @file datastore的默认分发器
 * @author r2space@gmail.com
 */

"use strict";

var light           = require("light-framework")
  , _               = light.util.underscore
  , util            = light.lang.util
  , log             = light.framework.log
  , helper          = light.framework.helper
  , context         = light.framework.context
  , response        = light.framework.response
  , board           = require("./ctrl_board")
  , datastore       = require("./datarider")
  , constant        = require("../constant")
  ;

/**
 * 生成缺省的handler
 * @param define
 * @param req
 * @param res
 * @returns {*}
 */
function getHandler(define, req, res) {
  var handler = new context().bind(req, res);
  handler.addParams("appName", define.appName);
  handler.addParams("schemaName", define.schemaName);
  handler.addParams("boardName", define.key);
  return handler;
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
 * 根据board的类别，确定需要调用的缺省的datastore方法
 * @param type
 * @returns {string}
 */
function defaultAction(type) {
  if (type === "1") { return "add"; }
  if (type === "2") { return "update"; }
  if (type === "3") { return "remove"; }

  return "getList";
}

/**
 * 进行分发操作
 * 1. 查询board表，用URL匹配board的URL
 * 2. 先检查board名的类及指定的action方法存在否，如果存在则交由该方法处理
 * 3. 上面的没能匹配，则尝试直接调用datastore的action方法
 * 4. 最后，还是没有匹配则返回404错误
 * @param req
 * @param res
 * @param type
 */
function bind(req, res, type) {

  var url = req.url
    , handler = new context().bind(req, res);

  board.getList(handler.copy({condition: { type: type, valid: 1 }, limit: Number.MAX_VALUE}), function(err, result) {
    if (err) {
      res.send(404);
      return;
    }

    // find board by url
    var define = _.find(result.items, function(item) {
      var route = item.advance.route || util.format("/%s/%s", item.schemaName, item.key);
      return new RegExp("^" + route + "([/|?]{1}[^/]+)?$", "i").test(url);
    });

    if (define) {
      var patch = sourcePath(define.schemaName.toLowerCase())
        , inject = helper.resolve(patch)
        , action = define.advance.action || defaultAction(type);

      // use controller
      if (inject && inject[action]) {
        log.debug("begin: " + patch + "$" + action, handler.uid);
        inject[action].call(this, getHandler(define, req, res), function(err, result) {
          log.debug("finished: " + patch + "$" + action, handler.uid);
          return response.send(res, err, result);
        });
        return;
      }

      // use datastore
      if (datastore[action]) {
        log.debug("begin: datastore$" + action, handler.uid);
        datastore[action].call(this, getHandler(define, req, res), function(err, result) {
          log.debug("finished: datastore$" + action, handler.uid);
          return response.send(res, err, result);
        });
        return;
      }
    }

    res.status(404).end();
  });
}

/**
 * datastore的route
 * 匹配所有URL，所以该方法需要在route的最后被设定
 * 如果指定的URL已经匹配上了，那么这里的route不会被再次调用
 * @param app
 */
exports.dispatch = function(app) {

  app.post("/*", function(req, res) {
    bind(req, res, "1");
  });

  app.put("/*", function(req, res) {
    bind(req, res, "2");
  });

  app.delete("/*", function(req, res) {
    bind(req, res, "3");
  });

  app.get("/*", function(req, res) {
    bind(req, res, "4");
  });
};
