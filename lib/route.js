/**
 * @file model类的缺省分发器
 * @author r2space@gmail.com
 */

"use strict";

var light           = require("light-framework")
  , fs              = light.lang.fs
  , path            = light.lang.path
  , util            = light.lang.util
  , _               = light.util.underscore
  , yaml            = light.util.jsyaml
  , conf            = light.util.config.app
  , response        = light.framework.response
  , context         = light.framework.context
  , log             = light.framework.log
  , constant        = require("./constant")
  , dispatcher      = require("./datarider/dispatcher")
  ;

/**
 * 分发
 * @param app
 */
exports.dispatch = function(app) {

  _.each(loadConfig(), function(items, key) {

    var object = resolve(key);
    _.each(items, function(route) {

      var method = httpMethod(route)
        , url = httpApiUrl(route)
        , custom = object[route.custom];

      if (custom) {
        app[method].call(app, url, custom);
        log.debug(util.format("route model: %s %s", method, url), null);
        return;
      }

      if (object[route.action]) {
        log.debug(util.format("route model: %s %s", method, url), null);
        app[method].call(app, url, function(req, res) {
          callAction(this, req, res, object[route.action], key, route.action);
        });
      }
    });
  });

  dispatcher.dispatch(app);
};

/**
 * 调用方法
 * @param ctx
 * @param req
 * @param res
 * @param action
 * @param object
 * @param func
 */
function callAction(ctx, req, res, action, object, func) {

  var handler = new context().bind(req, res);

  // 缺省条件
  var condition = handler.params.condition || {};
  if (_.isUndefined(condition.valid)) {
    condition.valid = 1;
  }
  handler.addParams("condition", condition);

  // 缺省顺序
  if (_.isUndefined(handler.params.order)) {
    handler.addParams("order", "-updateAt");
  }

  log.operation(util.format("begin: %s#%s.", object, func), handler.uid);
  action.call(ctx, handler, function(err, result) {
    log.operation(util.format("finish: %s#%s.", object, func), handler.uid);
    return response.send(res, err, result);
  });
}

/**
 * 生成对象实例
 * @param name
 * @returns {Object}
 */
function resolve(name) {
  return require(path.join(__dirname, name));
}

/**
 * 加载配置文件
 * @returns {*}
 */
function loadConfig() {
  if (fs.existsSync(__dirname + constant.FILE_CONF_ROUTE_YAML)) {
    return yaml.safeLoad(fs.readFileSync(__dirname + constant.FILE_CONF_ROUTE_YAML, "utf8"));
  }

  return {};
}

/**
 * @desc 获取URL部分
 * @param route
 * @returns {String}
 */
function httpApiUrl(route) {
  var target = route.url.split(/[ #,]/);
  return (conf.restapiprefix || "") + target[1];
}

/**
 * @desc 获取Method部分
 * @param route
 * @returns {String}
 */
function httpMethod(route) {
  var target = route.url.split(/[ #,]/);
  return target[0].toLowerCase();
}
