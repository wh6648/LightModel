/**
 * @file 存取用户信息的controller
 * @author lizheng
 * @module LightModel.lib.user
 */

"use strict";

var light     = require("light-framework")
  , sync      = light.util.async
  , _         = light.util.underscore
  , Mixed     = light.util.mongoose.Schema.Types.Mixed
  , check     = light.framework.validator
  , errors    = light.framework.error
  , log       = light.framework.log
  , Ctrl      = light.framework.mongoctrl
  , datarider = require("./datarider/datarider")
  , constant  = require("./constant")
  , type      = require("./type/group")
  , auth      = require("./security")
  , setting   = require("./setting")
  ;

/**
 * @desc 用户schema
 */
var User = {
    id:       { type: String, description: "用户标识"}
  , outer:    { type: String, description: "外部ID，用户导入时使用" }
  , name:     { type: String, description: "用户称" }
  , password: { type: String, description: "密码" }
  , type:     { type: Number, description: "用户类型" }
  , groups:   { type: Array,  description: "所属组一览" }
  , roles:    { type: Array,  description: "所属角色一览" }
  , email:    { type: String, description: "电子邮件地址" }
  , lang:     { type: String, description: "语言" }
  , timezone: { type: String, description: "时区" }
  , status:   { type: String, description: "状态" }
  , extend:   { type: Mixed,  description: "扩展属性" }
  , valid:    { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt: { type: Date,   description: "创建时间" }
  , createBy: { type: String, description: "创建者" }
  , updateAt: { type: Date,   description: "最终修改时间" }
  , updateBy: { type: String, description: "最终修改者" }
};

var addRules = [
  { name: "$.id", rule: ["isRequired"], message: "user id is required." }
, { name: "$.password", rule: ["isRequired"], message: "password is required." }
];

/**
 * @desc 创建用户
 * @param {Object} handler 上下文对象
 *        handler.params :
 *         appName
 *         schemaName
 *         id
 *         password
 *         outerId
 *         first
 *         middle
 *         last
 *         groups
 *         email
 *         lang
 *         timezone
 *         extend
 * @param {Function} callback 回调函数，返回添加的用户
 */
exports.add = function (handler, callback) {

  var params = handler.params;

  // 校验
  var checkValid = function(done) {
    var state = check.isValid(params.data, addRules);
    if (state.length > 0) {
      done(new errors.parameter.ParamError(state[0].message));
    } else {
      done();
    }
  };

  // 唯一
  var checkUnique = function(done) {
    handler.addParams("condition", {id: params.data.id, valid: constant.VALID});
    new Ctrl(handler, constant.MODULES_NAME_USER, User).getOne(function(err, us) {
      if (err) {
        return done(new errors.db.Add());
      }
      if (us) {
        return done(new errors.parameter.ParamError("Duplicate key:user id"));
      }
      done();
    });
  };

  // 设定extend值，并校验
  var createObject = function(done) {

    var settingCondition = { condition: { valid: constant.VALID, type: "USER_TYPE", value: params.data.type } };
    setting.getOne(handler.copy(settingCondition), function (err, result) {
      if(err){
        return done(err);
      }

      handler.addParams("schemaName", result.key);
      datarider.createExtendObject(handler, done);
    });

  };

  // 添加数据
  var callDataCtrl = function(user, done) {
    params.data.extend = user;
    new Ctrl(handler.copy({data: params.data}), constant.MODULES_NAME_USER, User).add(done);
  };

  sync.waterfall([checkValid, checkUnique, createObject, callDataCtrl], function(err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 删除用户
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          uid
 * @param {Function} callback 回调函数，返回删除的用户
 */
exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_USER, User).remove(callback);
};

/**
 * @desc 更新用户
 * @param {Object} handler 上下文对象
 *        handler.params :
 *         appName
 *         schemaName
 *         id
 *         password
 *         outer
 *         name
 *         groups
 *         roles
 *         email
 *         lang
 *         timezone
 *         extend
 * @param {Function} callback 回调函数，返回更新的用户
 */
exports.update = function (handler, callback) {

  var params = handler.params;
  params.data = params.data || {};

  var checkUnique = function(done) {
    new Ctrl(handler, constant.MODULES_NAME_USER, User).get(function(err, us) {
      if (err) {
        return done(new errors.db.Update());
      }
      if (us && us._doc._id.toString() !== params.id) {
        return callback(new errors.parameter.ParamError("Duplicate key:user id"));
      }
      done();
    });
  };

  var createObject = function (done) {

    var settingCondition = { condition: { valid: constant.VALID, type: "USER_TYPE", value: params.data.type } };
    setting.getOne(handler.copy(settingCondition), function (err, result) {
      if (err) {
        return done(err);
      }
      handler.addParams("schemaName", result.key);
      if (handler.params.data.extend) {
        datarider.createExtendObject(handler, done);
      } else {
        done(null, null);
      }
    });

  };

  var callDataCtrl = function(user, done) {
    if (user) {
      params.data.extend = user;
    }
    new Ctrl(handler.copy({data: params.data, id: params.id}), constant.MODULES_NAME_USER, User).update(done);
  };

  sync.waterfall([checkUnique, createObject, callDataCtrl], function(err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 查询符合条件的用户数
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          condition
 * @param {Function} callback 回调函数，返回用户数
 */
exports.total = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_USER, User).total(callback);
};

/**
 * @desc 根据用户ID,查询用户信息
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          uid
 * @param {Function} callback 回调函数，返回用户信息
 */
exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_USER, User).get(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 根据指定条件，检索用户信息
 * @param {Boolean} hasPassword 可选参数，是否包含密码
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          condition
 * @param {Function} callback 回调函数，返回用户信息
 */
exports.getOne = function (handler, hasPassword, callback) {

  if (_.isFunction(hasPassword)) {
    callback = hasPassword;
    hasPassword = false;
  }

  new Ctrl(handler, constant.MODULES_NAME_USER, User).getOne(function (err, result) {
    if (result) {
      if (!hasPassword) {
        delete result._doc.password;
      }
      return callback(err, result);
    } else {
      return callback(new errors.db.NotExist());
    }
  });
};

/**
 * @desc 根据指定条件查询用户
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          skip
 *          limit
 *          condition
 *          order
 *          select
 * @param {Function} callback 回调函数，返回用户一览
 */
exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_USER, User).getList(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 查询符合条件的文档并返回根据键分组的结果
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          field
 *          condition
 * @param {Function} callback 回调函数，返回Distinct结果
 */
exports.distinct = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_USER, User).distinct(callback);
};

exports.verify = function(handler, callback) {

  var condition = { condition: {id: handler.params.name, valid: constant.VALID} };
  new Ctrl(handler.copy(condition), constant.MODULES_NAME_USER, User).getOne(function (err, result) {
    if (err) {
      log.debug("Unable to retrieve the user.");
      return callback(new errors.db.Find());
    }

    // 用户不存在
    if (!result) {
      log.debug("User does not exist.");
      return callback(new errors.db.NotExist());
    }

    // 用户密码不正确
    if (result.password !== auth.sha256(handler.params.password)) {
      log.debug("The user password is not correct.");
      return callback(new errors.db.NotCorrect());
    }

    // 擦除密码
    delete result._doc.password;

    return callback(err, result);
  });
};

/**
 * @desc 检查用户名和密码是否匹配
 * @param {Object} handler 上下文对象
 *        handler.params :
 *          name
 *          password
 *          code
 * @param {Function} callback 回调函数，返回跟用户名和密码匹配的用户
 */
exports.isPasswordRight = function (handler, callback) {

  handler.addParams("condition", { id: handler.params.name, valid: constant.VALID });
  new Ctrl(handler, constant.MODULES_NAME_USER, User).getOne(function (err, result) {
    if (err) {
      return callback(new errors.db.Find());
    }

    // 用户不存在
    if (!result) {
      return callback(new errors.db.NotExist());
    }

    // 用户密码不正确
    if (result.password !== auth.sha256(handler.params.password)) {
      return callback(new errors.db.NotCorrect());
    }
    // 把ID变成字符串
    result._doc._id = result._doc._id.toHexString();

    delete result._doc.password; // 擦除密码
    return callback(err, result);
  });
};

// TODO: 统一缓存处理
var cachedRoles = {};
exports.roleUsers = function(handler, callback) {

  var roles = handler.params.roles;

  // 先从缓存里取值
  if (cachedRoles[roles]) {
    callback(undefined, cachedRoles[roles]);
    return;
  }

  // 从数据库取值
  handler.addParams("condition", { roles: { $all: roles }, valid: 1 });
  handler.addParams("select", "_id");
  exports.getList(handler, function(err, result) {

    var users = [];
    _.each(result.items, function(item) {
      users.push(item._id);
    });

    cachedRoles[roles] = users;
    callback(err, users);
  });
};

/**
 * @desc 关键字检索用户
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回用户一览
 */
exports.search = function (handler, callback) {
  if (!handler.params.search) {
    handler.addParams("search", "name, description");
  }
  new Ctrl(handler, constant.MODULES_NAME_USER, User).search(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * 获取Collection定义
 * @returns {*}
 */
exports.schema = function() {
  return new Ctrl(handler, constant.MODULES_NAME_USER, User).schema();
};

/**
 * 设定属性值
 * @param handler
 * @param result
 * @param callback
 */
function getOptions(handler, result, callback) {

  var define = handler.define || {
    selects: [{type: constant.OBJECT_TYPE_GROUP, item: "groups"}],
    additions: {group: ["name", "type"]}
  };

  type.getOptions(handler, define, result.items || result, function(err, groups) {
    (result._doc || result).options = {group: groups};
    callback(err, result);
  });
}
