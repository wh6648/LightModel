/**
 * @file 提供密码验证，加密，简易登陆等相关方法
 * @author r2space@gmail.com
 */

"use strict";

var light       = require("light-framework")
  , _           = light.util.underscore
  , conf        = light.util.config.app
  , crypto      = light.framework.crypto
  , context     = light.framework.context
  , errors      = light.framework.error
  , multiTenant = require("./company/multiTenant")
  , comp        = require("./company/ctrl_company")
  , constant    = require("./constant")
  , user        = require("./user");

/**
 * 基于Cookie，Session的简易登陆功能
 * 将用户信息保存到session当中
 * 用户ID保存到header中
 * @param {Object} req 请求
 * @param {Object} res 响应
 * @param {Function} callback 回调函数，验证成功返回用户信息
 */
exports.simpleLogin = function(req, res, callback) {

  var handler = new context().bind(req, res);

  // set company code
  multiTenant.setTenantCode(req);
  handler.addParams("code", req.session.code);

  if (handler.params.domain) {
    comp.getByDomain(handler, function (err, compResult) {
      if (err) {
        return callback(err);
      }

      if (compResult) {

        handler.addParams("code", compResult.code);

        user.isPasswordRight(handler, function (err, userResult) {
          if (err) {
            return callback(err);
          }

          // 用户信息保存到session中
          req.session.user = userResult;
          req.session.code = compResult.code;

          // 将用户ID保存到头信息里，用于移动终端开发。
          res.setHeader(constant.HEADER_UID_NAME, userResult._id);

          callback(err, userResult);
        });
      } else {
        return callback(new errors.http.BadRequest(__(handler, "company.error.notExist")));
      }
    });
  } else {
    user.isPasswordRight(handler, function (err, userResult) {
      if (err) {
        return callback(err);
      }

      // 用户信息保存到session中
      req.session.user = userResult;

      // 将用户ID保存到头信息里，用于移动终端开发。
      res.setHeader(constant.HEADER_UID_NAME, userResult._id);

      callback(err, userResult);
    });
  }
};

/**
 * 注销，删除Session
 * @param {Object} req 请求
 */
exports.simpleLogout = function (req) {
  req.session.destroy();
};

/**
 * Calculates the digest of all of the passed data to the hmac.
 *  algorithm - 'sha1', 'md5', 'sha256', 'sha512'
 *  encoding - 'hex', 'binary', 'base64'
 * @param {String} str source string
 * @returns {String} result string
 */
exports.sha256 = function (str) {

  if (_.isEmpty(str)) {
    return "";
  }

  return crypto.hmac("sha256", conf.hmackey).update(str).digest("hex");
};

/**
 * 加密
 * 使用的Algorithm - 'aes192'
 * 使用的encoding - 'hex'
 * 内容的encoding - 'utf-8'
 * @param {String} str 加密对象文件
 * @param {String} secret 密码
 * @returns {String} 加密后的内容
 */
exports.encrypt = function (str, secret) {
  var cipher = crypto.createCipher("aes192", secret);
  var crypted = cipher.update(str, "utf8", "hex");
  return crypted + cipher.final("hex");
};

/**
 * 解密
 * 使用的Algorithm - 'aes192'
 * 使用的encoding - 'hex'
 * 内容的encoding - 'utf-8'
 * @param {String} str 加密对象文件
 * @param {String} secret 密码
 * @returns {String} 加密后的内容
 */
exports.decrypt = function (str, secret) {
  var decipher = crypto.createDecipher("aes192", secret);
  var decrypted = decipher.update(str, "hex", "utf8");
  return decrypted + decipher.final("utf8");
};

/**
 * 生成24位UUID
 * 符合 rfc4122 v4
 */
exports.uuid = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
