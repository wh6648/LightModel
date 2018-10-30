/**
 * @file Structure的工具类,生成mobile端对应的数据结构源码
 * @author fzcs@live.cn
 */

"use strict";

var light           = require("light-framework")
  , _               = light.util.underscore
  , fs              = light.lang.fs
  , constant        = light.framework.constant
  , errors          = light.framework.error
  , log             = light.framework.log
  , numberType      = require("../type/number")
  , booleanType     = require("../type/boolean")
  , arrayType       = require("../type/array")
  , mixedType       = require("../type/mixed");


exports.getFileContent = function (structures, boards){

  var header = "\n#import \"SmartSDK.h\"\n\n";
  var implement = "\n#import \"Entities.h\"\n\n";
  var apiUrl = "\n";


  _.each(structures,function(structure){
    var data = handleOneStructure(structure);
    header += data.header;
    implement += data.implement;
  });

  _.each(boards,function(board){
    if(board.valid){
      var path;
      var method = "GET", action = "list";
      switch(board.type) {
        case 1:
          method = "POST";
          action = "add";
          break;
        case 2:
          method = "PUT";
          action = "update";
          break;
        case 3:
          method = "DELETE";
          action = "delete";
          break;
      }
      if(board.advance && board.advance.route){
        path = board.advance.route;
      }else{
        path = "/" + board.schemaName + "/" + action;
      }

      //#define API_PRINTER_LIST                @"/api/printer/list.json"
      apiUrl += "//"+method+"\n";
      apiUrl += "#define kUrl" + board.schemaName + upperFirst(board.key) + "     @\"" + path+"\"\n\n";
    }
  });



  var result = [];
  result.push({name:'Entities.h',content:header});
  result.push({name:'Entities.m',content:implement});
  result.push({name:'APIUrl.h',content:apiUrl});
  return result;
}

function handleOneStructure(structure){


  var interface_tmpl
    = "@interface <%= class_name %> : DAEntity\n"
    + "<%= properties %>\n"
    + "@end\n\n";

  var property_tmpl
    = "@property (<%= attr1 %>, <%= attr2 %>) <%= type %> <%= name %>;\n";


  var implementation_tmpl
    = "@implementation <%= class_name %>\n"
    + "<%= implements %>\n"
    + "@end\n\n";

  var sub_class_implement_tmpl
    = "+(Class) <%= key %>_class {\n"
    + "    return [<%= name %> class];\n"
    + "}\n";


  var sub_classes = [];
  var attributes = [];
  _.each(structure.items,function(item){
    var sub_class = {};
    if(item.type == mixedType.type){

      sub_class.key = item.key;
      sub_class.name = className(item.key);
      sub_class.items = item.sub;
      sub_classes.push(sub_class);

    }else if (item.type == arrayType.type){

      sub_class.key = item.key;
      sub_class.name = className(item.key);
      sub_class.items = item.sub;
      sub_class.array = true;
      sub_classes.push(sub_class);

    }
    attributes.push(handleOneAttribute(item));
  });

  var header_context = "";
  var implement_context = "";

  _.each(sub_classes,function(cls){

    var cls_data = {};
    cls_data.class_name = cls.name;
    cls_data.properties = "";

    _.each(cls.items,function(item){

      var property_data = {};
      property_data.attr1 = "retain";
      property_data.attr2 = "nonatomic";
      property_data.type  = "NSString";
      property_data.name  = "*"+item.name;

      cls_data.properties += _.template(property_tmpl, property_data);
    });
    header_context += _.template(interface_tmpl, cls_data);
    implement_context += _.template(implementation_tmpl, {class_name:cls.name,implements:""});
  });

  var cls_data = {};
  cls_data.class_name = className(structure.schemaName);
  cls_data.properties = "";
  cls_data.implements = "";

  _.each(attributes,function(attr){
    cls_data.properties += _.template(property_tmpl, attr);
  });
  header_context += _.template(interface_tmpl, cls_data);


  _.each(sub_classes,function(cls){
    if(cls.array){
      cls_data.implements += _.template(sub_class_implement_tmpl, cls);
    }
  });

  implement_context += _.template(implementation_tmpl, cls_data);

  return {header:header_context,implement:implement_context};
}

function handleOneAttribute(item){

  var property_data = {};
  switch(item.type)
  {
//    case stringType.type :
//    case dateType.type:
//    case objectidType.type:
//      property_data.attr1 = "retain";
//      property_data.attr2 = "nonatomic";
//      property_data.type  = "NSString";
//      property_data.name  = "*"+item.key;
//      break;
    case numberType.type:
      property_data.attr1 = "retain";
      property_data.attr2 = "nonatomic";
      property_data.type  = "NSNumber";
      property_data.name  = "*"+item.key;
      break;
    case booleanType.type:
      property_data.attr1 = "assign";
      property_data.attr2 = "nonatomic";
      property_data.type  = "BOOL";
      property_data.name  = item.key;
      break;
    case mixedType.type:
      property_data.attr1 = "retain";
      property_data.attr2 = "nonatomic";
      property_data.type  = className(item.key);
      property_data.name  = "*"+item.key;
      break;
    case arrayType.type:
      property_data.attr1 = "retain";
      property_data.attr2 = "nonatomic";
      property_data.type  = "NSArray";
      property_data.name  = "*"+item.key;
      break;
    default:
      property_data.attr1 = "retain";
      property_data.attr2 = "nonatomic";
      property_data.type  = "NSString";
      property_data.name  = "*"+item.key;
  }
  //return _.template(property_tmpl, property_data);
  return property_data;
}

function upperFirst(word){
  return word.substring(0,1).toUpperCase() + word.substring(1);
}

function className(word){
  return "DA" + upperFirst(word);
}
