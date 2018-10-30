/**
 * @file 存取数据结构的module
 * @author r2space@hotmail.com
 * @module light.datarider.mod_structure
 */

"use strict";

var light         = require("light-framework")
  , Schema        = light.util.mongoose.Schema
  , Mixed         = Schema.Types.Mixed
  , conn          = light.framework.mongoconn
  , constant      = require("../constant")
  ;

var Validator = new Schema({
    name:         { type: String, description: "校验对象" }
  , rule:         [ String ]
  , message:      { type: Mixed,  description: "校验用属性" }
  });

var Sub = new Schema({
    name:         { type: String, description: "子项目" }
  , type:         { type: String, description: "String, Number, Date, Array, Mixed" }
  });

var Item = new Schema({
    key:          { type: String, description: "标示key" }
  , type:         { type: String, description: "String, Number, Date, Array, Mixed" }
  , name:         { type: String, description: "名称" }
  , translation:  { type: String, description: "名称翻译" }
  , validator:    [ Validator ]
  , sub:          [ Sub ]
  , default:      { type: Mixed,  description: "缺省值" }
  , description:  { type: String, description: "说明" }
  , reserved:     { type: Number, description: "字段类型 1：系统默认 2：用户自定义", default: 2}
  });

var Structure = new Schema({
    public:       { type: Number, description: "公开标识，1：公开，0：非公开" }
  , lock:         { type: Number, description: "更新锁，1：锁定，0：非锁定" }
  , version:      { type: String, description: "版本" }
  , appName:      { type: String, description: "App名", required: true} //
  , schemaName:   { type: String, description: "Schema名", required: true} //
  , items:        [ Item ]
  , extend:       { type: Mixed,  description: "扩展属性" }
  , valid:        { type: Number, description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,   description: "创建时间" }
  , createBy:     { type: String, description: "创建者" }
  , updateAt:     { type: Date,   description: "更新时间" }
  , updateBy:     { type: String, description: "更新者" }
  });

/**
 * @desc 使用定义好的Schema, 通过公司Code生成Structure的model
 * @param {String} code 公司code
 * @returns {Object} Structure model
 */
function model(code) {
  return conn.model(code, constant.MODULES_NAME_DATASTRUT, Structure);
}

/**
 * @desc 添加Structure
 * @param {String} code 公司code
 * @param {Object} newStructure Structure对象
 * @param {Function} callback 回调函数，返回添加的Structure
 */
exports.add = function (code, newStructure, callback) {

  var Structure = model(code);

  new Structure(newStructure).save(function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据StructureID,删除Structure
 * @param {String} code 公司code
 * @param {String} structureId StructureID
 * @param {Object} removeStructure 删除用Structure对象
 * @param {Function} callback 回调函数，返回删除的Structure
 */
exports.remove = function (code, structureId, removeStructure, callback) {

  var structure = model(code);

  removeStructure = removeStructure || { };
  removeStructure.valid = constant.INVALID;

  structure.findByIdAndUpdate(structureId, removeStructure, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据StructureID,更新Structure
 * @param {String} code 公司code
 * @param {String} structureId StructureID
 * @param {Object} updateStructure 更新用Structure对象
 * @param {Function} callback 回调函数，返回更新的Structure
 */
exports.update = function (code, structureId, updateStructure, callback) {

  var structure = model(code);

  structure.findByIdAndUpdate(structureId, updateStructure, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 统计符合条件的件数
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Function} callback  回调函数，返回Structure总数
 */
exports.total = function (code, condition, callback) {

  var structure = model(code);

  structure.count(condition, function (err, count) {
    return callback(err, count);
  });
};

/**
 * @desc 根据StructureID,获取指定Structure
 * @param {String} code 公司code
 * @param {String} structureId StructureID
 * @param {Function} callback 回调函数，返回Structure信息
 */
exports.get = function (code, structureId, callback) {

  var structure = model(code);

  structure.findById(structureId, function (err, result) {
    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Structure(只返回第一个有效的结果)
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Function} callback 回调函数，返回Structure信息
 */
exports.getOne = function (code, condition, callback) {

  var structure = model(code);

  structure.findOne(condition, function (err, result) {

    return callback(err, result);
  });
};

/**
 * @desc 根据指定条件查询Structure
 * @param {String} code 公司code
 * @param {Object} condition 查询条件
 * @param {Number} skip 跳过的文书数，默认为0
 * @param {Number} limit 返回的文书的上限数目，默认为20
 * @param {String} order 排序
 * @param {Function} callback 回调函数，返回Structure列表
 */
exports.getList = function (code, condition, skip, limit, order, callback) {

  var structure = model(code);

  structure.find(condition)
    .skip(skip || constant.MOD_DEFAULT_START)
    .limit(limit || constant.MOD_DEFAULT_LIMIT)
    .sort(order)
    .exec(function (err, result) {
      return callback(err, result);
    });
};

/**
 * @desc 查询符合条件的文档并返回根据键分组的结果
 * @param {String} code 公司code
 * @param {String} field 分组字段
 * @param {Object} condition distinct条件
 * @param {Function} callback 回调函数，返回Distinct的结果
 */
exports.distinct = function (code, field, condition, callback) {

  var structure = model(code);

  structure.distinct(field, condition, function (err, result) {

    return callback(err, result);
  });
};