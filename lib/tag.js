/**
 * @file 标签
 * @author r2space@gmail.com
 * @module tag.js
 */

"use strict";

var light     = require("light-framework")
  , Ctrl      = light.framework.mongoctrl
  , async     = light.util.async
  , _         = light.util.underscore
  , constant  = require("./constant");

var Tag = {
    type:         { type: String, description: "Tag的有效范围" }
  , name:         { type: String, description: "Tag名称" }
  , counter:      { type: Number, description: "使用次数", default: 1 }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
};

exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TAG, Tag).getList(callback);
};

exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_TAG, Tag).remove(callback);
};

/**
 * 添加标签，如果已经存在则计数器加一，如果不存在则新规
 * tag可以一次传递多个
 * @param handler
 * @param callback
 */
exports.add = function (handler, callback) {

  var data = handler.params.data
    , tags = _.isArray(data.name) ? data.name : [data.name]
    , ctrl = new Ctrl(handler, constant.MODULES_NAME_TAG, Tag);

  // 没指定type，用默认type
  if (!data.type) {
    data.type = constant.DEFAULT_TAG;
  }

  async.forEach(tags, function(tag, loop) {

    // 判断是否存在
    handler.addParams("condition", { name: tag });
    ctrl.getOne(function(err, result) {

      // 更新计数器
      if (result) {
        ctrl.id = result._id;
        data.name = tag;
        data.counter = result.counter + 1;
        ctrl.update(function(err, result) {
          loop(err, result);
        });

      // 新规
      } else {
        data.name = tag;
        ctrl.add(function(err, result) {
          loop(err, result);
        });
      }
    });

  }, function(err, result) {
    callback(err, result);
  });

};
