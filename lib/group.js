/**
 * @file 存取组信息的controller
 * @author lizheng
 * @module LightModel.lib.group
 */

"use strict";

var light     = require("light-framework")
  , datarider = require("./datarider/datarider")
  , sync      = light.util.async
  , _         = light.util.underscore
  , Mixed     = light.util.mongoose.Schema.Types.Mixed
  , check     = light.framework.validator
  , errors    = light.framework.error
  , Ctrl      = light.framework.mongoctrl
  , constant  = require("./constant")
  , group     = require("./type/group")
  , user      = require("./type/user")
  ;

/**
 * @desc 组schema
 */
var Group = {
    name:         { type: String, description: "组名" }
  , outer:        { type: String, description: "outer id"}
  , type:         { type: String, description: "类型, 1:部门（公司组织结构）, 2:组（自由创建）, 3:职位组" }
  , description:  { type: String, description: "描述" }
  , visible:      { type: String, description: "可见性, 1:私密，2:公开" }
  , parent:       { type: String, description: "父组标识" }
  , owners:       { type: Array,  description: "经理一览" }
  , sort:         { type: String, description: "排序" }
  , status:       { type: String, description: "状态" }
  , extend:       { type: Mixed,  description: "扩展属性" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

var rules = [
  { name: "$.name", rule: ["isRequired"], message: "name is required." }
];

/**
 * @desc 添加组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回新创建的组
 */
exports.add = function (handler, callback) {

  var params = handler.params;

  // 名称不能为空
  var checkValid = function(done) {
    var state = check.isValid(params.data, rules);
    if (state.length > 0) {
      done(new errors.parameter.ParamError(state[0].message));
    } else {
      done();
    }
  };

  // 唯一
  var checkUnique = function(done) {
    handler.addParams("condition", {name: params.data.name, valid: constant.VALID});
    new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).getOne(function(err, gr) {
      if (err) {
        return done(new errors.db.Add());
      }
      if (gr) {
        return done(new errors.parameter.ParamError("Duplicate key:name"));
      }
      done();
    });
  };

  // 设定extend值，并校验
  var createObject = function(done) {
    handler.addParams("schemaName", "Group");
    if (params.data.extend) {
      datarider.createExtendObject(handler, done);
    } else {
      done(null, null);
    }
  };

  // 添加数据
  var callDataCtrl = function(group, done) {
    params.data.extend = group;
    new Ctrl(handler.copy({data: params.data}), constant.MODULES_NAME_GROUP, Group).add(done);
  };

  sync.waterfall([checkValid, checkUnique, createObject, callDataCtrl], callback);
};

/**
 * @desc 删除组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回删除后的组
 */
exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).remove(callback);
};

/**
 * @desc 更新组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回更新后的组
 */
exports.update = function (handler, callback) {

  var params = handler.params;

  var checkValid = function(done) {
    var state = check.isValid(params.data, rules);
    if (state.length > 0) {
      done(new errors.parameter.ParamError(state[0].message));
    } else {
      done();
    }
  };

  var checkUnique = function(done) {
    new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).get(function(err, gr) {
      if (err) {
        return done(new errors.db.Update());
      }
      if (gr && gr._doc._id.toString() !== params.id) {
        return done(new errors.parameter.ParamError("Duplicate key:name"));
      }
      done();
    });
  };

  var createObject = function(done) {
    handler.addParams("schemaName", "Group");
    if (params.data.extend) {
      datarider.createExtendObject(handler, done);
    } else {
      done(null, null);
    }
  };

  var callDataCtrl = function(group, done) {
    params.data.extend = group;
    new Ctrl(handler.copy({data: params.data, id: params.id}), constant.MODULES_NAME_GROUP, Group).update(done);
  };

  sync.waterfall([checkValid, checkUnique, createObject, callDataCtrl], callback);
};

/**
 * @desc 获取组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组信息
 */
exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).get(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 获取Group
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回Category
 */
exports.getOne = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).getOne(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 根据指定条件查询组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组列表
 */
exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).getList(function(err, result) {
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
 * @param {Function} callback 回调函数，返回Distinct结果
 */
exports.distinct = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).distinct(callback);
};

/**
 * @desc 关键字检索组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组一览
 */
exports.search = function (handler, callback) {
  handler.addParams("search", "name, description");
  new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).search(function(err, result) {
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
  return new Ctrl(handler, constant.MODULES_NAME_GROUP, Group).schema();
};

/**
 * 设定属性值
 * @param handler
 * @param result
 * @param callback
 */
function getOptions(handler, result, callback) {
  var define = handler.define || {
    selects: [
      {type: constant.OBJECT_TYPE_GROUP, item: "parent"},
      {type: constant.OBJECT_TYPE_USER, item: "owners"}
    ],
    additions: {group: ["name"], user: ["id", "name"]}
  };

  var options = {};
  group.getOptions(handler, define, result.items || result, function(err, groups) {
    options.group = groups;

    user.getOptions(handler, define, result.items || result, function(err, users) {
      options.user = users;

      (result._doc || result).options = options;
      callback(err, result);
    });
  });
}
