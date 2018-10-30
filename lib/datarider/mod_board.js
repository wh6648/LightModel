/**
 * @file 存取Board信息的module
 * @author sl_say@hotmail.com
 * @module light.datarider.mod_board
 */

"use strict";

var light         = require("light-framework")
  , Schema        = light.util.mongoose.Schema
  , Mixed         = Schema.Types.Mixed
  , conn          = light.framework.mongoconn
  , constant      = require("../constant");

var Filter = new Schema({
    item:         { type: String, description: "Schema的item" }
  , operator:     { type: String, description: "条件: >, <, =" }
  , operatorParam:{ type: String, description: "参数名称" }
  , operatorValue:{ type: String, description: "参数值，参数名没指定或指定的参数名没有值则，这个值被使用" }
  });

var Select = new Schema({
    item:         { type: String, description: "Schema的item" }
  , select:       { type: String, description: "选择:1 非选择:0" }
  , format:       { type: String, description: "格式化" }
  , alias:        { type: String, description: "项目别名" }
  , type:         { type: String, description: "项目类型: 1 用户 2 组 3 分类 4 文件" }
  });

var Sort = new Schema({
    item:         { type: String, description: "Schema的item" }
  , order:        { type: String, description: "desc asc" }
  , index:        { type: String, description: "index" }
  , dynamic:      { type: String, description: "排序字段是否是通过参数动态指定的 1: 静态 2: 动态" }
  });

var Group = new Schema({
    item:         { type: String, description: "Schema的item" }
  , operator:     { type: String, description: "$sum,$avg..." }
  , index:        { type: String, description: "index" }
  });

var Board = new Schema({
    appName:      { type: String, description: "App名", required: true }
  , schemaName:   { type: String, description: "Schema名", required: true }
  , key:          { type: String, description: "キー" }
  , name:         { type: String, description: "名称" }
  , type:         { type: Number, description: "类别 1：添加 2：更新 3：删除 4：通常检索 5：全文检索", default: 4 }
  , filters:      [ Filter ]
  , selects:      [ Select ]
  , sorts:        [ Sort ]
  , groups:       [ Group ]
  , advance:      { type: Mixed,  description: "高级项 含：before, after, route, action, next等" }
  , additions:    { type: Mixed,  description: "附加项" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "最终修改时间" }
  , updateBy:     { type: String, description: "最终修改者" }
  });

/**
 * @desc 使用定义好的Schema, 通过公司Code生成Board的model
 * @param {String} code 公司code
 * @returns {Object} Board model
 */
function model(code) {
  return conn.model(code, constant.MODULES_NAME_DATABOARD, Board);
}

/**
 * @desc 添加Board
 * @param {String} code 公司code
 * @param {Object} newBoard Board对象
 * @param {Function} callback 回调函数，返回添加的Board
 */
exports.add = function (code, newBoard, callback) {

  var Board = model(code);

  new Board(newBoard).save(function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据BoardID,删除Board
 * @param {String} code 公司code
 * @param {String} boardId BoardID
 * @param {Object} removeBoard 删除用Board对象
 * @param {Function} callback 回调函数，返回删除的Board
 */
exports.remove = function (code, boardId, removeBoard, callback) {

  var board = model(code);

  removeBoard = removeBoard || { };
  removeBoard.valid = constant.INVALID;

  board.findByIdAndUpdate(boardId, removeBoard, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据BoardID,更新Board
 * @param {String} code 公司code
 * @param {String} boardId BoardID
 * @param {Object} updateBoard 更新用Board对象
 * @param {Function} callback 回调函数，返回更新的Board
 */
exports.update = function (code, boardId, updateBoard, callback) {

  var board = model(code);

  board.findByIdAndUpdate(boardId, updateBoard, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 统计符合条件的件数
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Function} callback  回调函数，返回Board总数
 */
exports.total = function (code, condition, callback) {

  var board = model(code);

  board.count(condition, function (err, count) {
    return callback(err, count);
  });
};

/**
 * @desc 根据BoardID,获取指定Board
 * @param {String} code 公司code
 * @param {String} boardId BoardID
 * @param {Function} callback 回调函数，返回Board信息
 */
exports.get = function (code, boardId, callback) {

  var board = model(code);

  board.findById(boardId, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Board(只返回第一个有效的结果)
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Function} callback 回调函数，返回Board信息
 */
exports.getOne = function (code, condition, callback) {

  var board = model(code);

  board.findOne(condition, function (err, result) {

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Board
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Number} skip 跳过的文书数，默认为0
 * @param {Number} limit 返回的文书的上限数目，默认为20
 * @param {String} order 排序
 * @param {Function} callback 回调函数，返回Board列表
 */
exports.getList = function (code, condition, skip, limit, order, callback) {

  var board = model(code);

  board.find(condition)
    .skip(skip || constant.MOD_DEFAULT_START)
    .limit(limit || constant.MOD_DEFAULT_LIMIT)
    .sort(order)
    .exec(function (err, result) {
      return callback(err, result);
    });
};
