/**
 * @file 存取Category的Controller
 * @author sl_say@hotmail.com
 * @module LightModel.lib.category
 */

"use strict";

var light       = require("light-framework")
  , datarider   = require("./datarider/datarider")
  , sync        = light.util.async
  , _           = light.util.underscore
  , Mixed       = light.util.mongoose.Schema.Types.Mixed
  , check       = light.framework.validator
  , errors      = light.framework.error
  , Ctrl        = light.framework.mongoctrl
  , constant    = require("./constant")
  , category    = require("./type/category")
  ;

/**
 * @desc Category的model
 */
var Category = {
    type:                { type: String, description: "类型:Store,Date,..等", required: true}
  , categoryId:          { type: String, description: "分类ID", required: true }
  , name:                { type: String, description: "分类名" }
  , sort:                { type: String, description: "排序" }
  , value:               { type: String, description: "值" }
  , translation:         { type: String, description: "翻译Key" }
  , description:         { type: String, description: "分类描述" }
  , parent:              { type: String, description: "父目录ID" }
  , ancestors:           [ String ]
  , visible:             { type: String, description: "表示非表示" }
  , extend:              { type: Mixed,  description: "扩展属性" }
  , valid:               { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:            { type: Date,   description: "创建时间" }
  , createBy:            { type: String, description: "创建者" }
  , updateAt:            { type: Date,   description: "更新时间" }
  , updateBy:            { type: String, description: "更新者" }
};

/**
 * @desc 添加Category
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回追加的Category结果
 */
exports.add = function (handler, callback) {

  var params = handler.params.data;

  // 校验
  var checkValid = function(done) {

    var rules = [
      { name: "$.type", rule: ["isRequired"], message: "Type is required." },
      { name: "$.categoryId", rule: ["isRequired"], message: "Category ID is required." }
    ];
    if (params.parent) {
      rules.push({ name: "$.categoryId", rule: ["unEquals", params.parent], message: "Parent is invalid." });
    }

    var state = check.isValid(params, rules);
    if (state.length > 0) {
      done(new errors.parameter.ParamError(state[0].message));
    } else {
      done();
    }
  };

  // 唯一
  var checkUnique = function(done) {

    var condition = {type: params.type, categoryId: params.categoryId, valid: constant.VALID};
    new Ctrl(handler.copy({condition: condition}), constant.MODULES_NAME_CATEGORY, Category).getOne(function(err, ca) {
      if (err) {
        return done(new errors.db.Add());
      }
      if (ca) {
        return done(new errors.parameter.ParamError("Duplicate key:type, categoryId"));
      }
      done();
    });
  };

  // 生成Ancestors
  var createAncestors = function(done) {
    var condition = {type: params.type, categoryId: params.parent, valid: constant.VALID};
    new Ctrl(handler.copy({condition: condition}), constant.MODULES_NAME_CATEGORY, Category).getOne(function(err, cat) {
      var ancestors = [];
      if (cat) {
        ancestors = cat.ancestors;
        ancestors.push(params.parent);
      }

      done(err, ancestors);
    });
  };

  // 设定extend值，并校验
  var createObject = function(ancestors, done) {
    handler.addParams("schemaName", params.type);
    if (params.extend) {
      datarider.createExtendObject(handler, function(err, category) {
        done(err, category, ancestors);
      });
    } else {
      done(null, null, ancestors);
    }
  };

  // 添加数据
  var callDataCtrl = function(category, ancestors, done) {
    params.ancestors = ancestors;
    params.extend = category;
    new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).add(done);
  };

  sync.waterfall([checkValid, checkUnique, createAncestors, createObject, callDataCtrl], callback);
};

/**
 * @desc 根据ID，删除Category
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回删除后的Category
 */
exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).remove(callback);
};

/**
 * @desc 根据指定条件，删除Category
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回删除后的Category
 */
exports.removeBy = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).removeBy(callback);
};

/**
 * @desc 更新Category
 * @param {Object} handler 上下文对象
 * @param {Function} callback 返回更新的Category
 */
exports.update = function (handler, callback) {

  var params = handler.params.data
    , id = handler.params.id;

  // 校验
  var checkValid = function(done) {

    var rules = [
      { name: "$.type", rule: ["isRequired"], message: "Type is required." },
      { name: "$.categoryId", rule: ["isRequired"], message: "Category ID is required." }
    ];
    if (params.parent) {
      rules.push({ name: "$.categoryId", rule: ["unEquals", params.parent], message: "Parent is invalid." });
    }

    var state = check.isValid(params, rules);
    if (state.length > 0) {
      done(new errors.parameter.ParamError(state[0].message));
    } else {
      done();
    }
  };

  // 唯一
  var checkUnique = function(done) {
    var condition = { type: params.type, categoryId: params.categoryId, valid: constant.VALID };
    new Ctrl(handler.copy({condition: condition}), constant.MODULES_NAME_CATEGORY, Category).getOne(function(err, ca) {
      if (err) {
        return done(new errors.db.Add());
      }
      if (ca && ca._doc._id.toString() !== handler.params.id) {
        return done(new errors.parameter.ParamError("Duplicate key:type,categoryId"));
      }
      done();
    });
  };

  // 设定extend值，并校验
  var createObject = function(done) {
    handler.addParams("schemaName", params.type);
    if (params.extend) {
      datarider.createExtendObject(handler, function(err, category) {
        done(err, category);
      });
    } else {
      done(null, null);
    }
  };

  // 添加数据
  var callDataCtrl = function(category, done) {
    params.extend = category;
    new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).update(done);
  };

  sync.waterfall([checkValid, checkUnique, createObject, callDataCtrl], callback);
};

/**
 * @desc 获取Category件数
 * @param {Object} handler 上下文对象
 * @param {function} callback 返回Category件数
 */
exports.total = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).total(callback);
};

/**
 * @desc 根据用户ID,查询Category信息
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回Category信息
 */
exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).get(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
* @desc 获取Category
* @param {Object} handler 上下文对象
* @param {Function} callback 返回Category
*/
exports.getOne = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).getOne(callback);
};

/**
 * @desc 获取Category一览
 * @param {Object} handler 上下文对象
 * Exp.
 *  start: 0
 *  limit: 20
 *  condition: {}
 *  order: {sort: "asc"}
 * @param {Function} callback 返回Category一览
 */
exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).getList(function(err, result) {
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
  new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).distinct(callback);
};

/**
 * 获取Collection定义
 * @returns {*}
 */
exports.schema = function() {
  return new Ctrl(handler, constant.MODULES_NAME_CATEGORY, Category).schema();
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
      {type: constant.OBJECT_TYPE_CATEGORY, item: "parent"}
    ],
    additions: {category: ["name", "categoryId"]}
  };

  category.getOptions(handler, define, result.items || result, function(err, categories) {
    (result._doc || result).options = {category: categories};
    callback(err, result);
  });
}