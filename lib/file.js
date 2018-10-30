/**
 * @file 存取文件信息的controller
 * @author 罗浩
 * @module light-model.file
 */

"use strict";

var light     = require("light-framework")
  , datarider = require("./datarider/datarider")
  , ph        = light.lang.path
  , fs        = light.lang.fs
  , sync      = light.util.async
  , _         = light.util.underscore
  , mongo     = light.util.mongoose
  , errors    = light.framework.error
  , log       = light.framework.log
  , context   = light.framework.context
  , conn      = light.framework.mongoconn
  , Ctrl      = light.framework.mongoctrl
  , helper    = light.framework.helper
  , response  = light.framework.response
  , conf      = light.util.config.app
  , async     = light.util.async
  , Schema    = mongo.Schema
  , Mixed     = Schema.Types.Mixed
  , ObjectId  = mongo.Schema.Types.ObjectId
  , GridStore = light.util.mongodb.GridStore
  , ObjectID  = light.util.mongodb.ObjectID
  , constant  = require("./constant")
  , type      = require("./type/user")
  ;

/**
 * @desc 文件实体存放到GridFS中，由于GridFS无法更新文件的元数据,File Schema用于存储更新用的文件元数据.
 */
var File = {
    fileId:       { type: ObjectId, description: "GridFS的ID", unique: true }
  , length:       { type: Number,   description: "文件大小" }
  , name:         { type: String,   description: "文件名" }
  , category:     { type: String,   description: "文件分类" }
  , description:  { type: String,   description: "文件说明" }
  , contentType:  { type: String,   description: "文件类型" }
  , extend:       { type: Mixed,    description: "扩展属性" }
  , valid:        { type: Number,   description: "删除 0:无效 1:有效", default: constant.VALID }
  , createAt:     { type: Date,     description: "创建时间" }
  , createBy:     { type: String,   description: "创建者" }
  , updateAt:     { type: Date,     description: "更新时间" }
  , updateBy:     { type: String,   description: "更新者" }
};

/**
 * @desc 删除一个 file (meta 信息) fileId为 meta id
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回 file 的 meta 信息:
 */
exports.remove = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FILE, File).remove(callback);
};

/**
 * 仅更新meta信息
 * @param handler
 * @param callback
 */
exports.update = function (handler, callback) {

  var data = handler.params.data;
  var createExtend = function(done) {
    if (data.extend) {
      datarider.createExtendObject(handler.copy({ schemaName: "File", data: data }), function(err, extend) {
        done(err, extend);
      });
    } else {
      done(null, {});
    }
  };

  var saveMeta = function(extend, done) {
    data.extend = extend;
    new Ctrl(handler, constant.MODULES_NAME_FILE, File).update(function(err, resu) {
      done(err, resu);
    });
  };

  sync.waterfall([createExtend, saveMeta], callback);
};

/**
 * @desc 获取File一览
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回file一览
 */
exports.getList = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FILE, File).getList(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 关键字检索File
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回file一览
 */
exports.search = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FILE, File).search(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * @desc 获取一个 file (meta 信息)
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回 file 的 meta 信息:
 */
exports.get = function (handler, callback) {
  new Ctrl(handler, constant.MODULES_NAME_FILE, File).get(function(err, result) {
    if (err || !result) {
      callback(err);
    } else {
      getOptions(handler, result, callback)
    }
  });
};

/**
 * 将指定的文件，保存文件到GridFS
 * @param code
 * @param file
 * @param callback
 */
function save(code, file, callback) {

  sync.waterfall([
    function(next) {
      conn.nativeopen(code, function (err, db) {
        if (err) {
          db.close();
          return next(new errors.db.Add());
        }

        // 创建一个文件, 并且打开它. 每次生成新的fileID, 即使相同的文件名也可以多次保存.
        var fileName = ph.basename(file.originalFilename)
          , options = { content_type: file.headers["content-type"] };
        next(null, db, new GridStore(db, new ObjectID(), fileName, constant.MOD_GRIDSTORE_MODE_WRITE, options));
      });
    },
    function(db, grid, next) {
      grid.open(function (err, grid) {
        if (err) {
          db.close();
          return next(new errors.db.Add());
        }

        next(null, db, grid);
      });
    },
    function(db, grid, next) {
      var filePath = fs.realpathSync(ph.join(conf.tmp, ph.basename(file.path)));
      grid.writeFile(filePath, function (err, doc) {
        db.close();

        if (err) {
          return next(new errors.db.Add());
        }

        var meta = {
          fileId: doc.fileId,
          length: doc.position ? doc.position : 0,
          name: doc.filename,
          contentType: doc.contentType
        };
        next(err, meta);
      });
    }
  ], function(err, meta) {
    callback(err, meta);
  });
}

/**
 * 上传文件，同时保存META信息
 * @param {Object} handler 上下文对象
 * @param callback
 */
exports.create = function(handler, callback) {

  sync.map(handler.params.files, function (file, next) {
    var saveFile = function(done) {
      save(handler.code, file, done);
    };

    var createExtend = function(meta, done) {
      if (handler.params.extend) {
        var attach = {
          schemaName: "File",
          data: {extend: handler.params.extend}
        };
        datarider.createExtendObject(handler.copy(attach), function(err, extend) {
          meta.extend = extend;
          done(err, meta);
        });
      } else {
        done(null, meta);
      }
    };

    var saveMeta = function (meta, done) {
      new Ctrl(handler.copy({ data: meta }), constant.MODULES_NAME_FILE, File).add(done);
    };

    sync.waterfall([ saveFile, createExtend , saveMeta], next);
  }, function(err, result) {
    callback(err, { totalItems: result.length, items: result });
  });
};

/**
 * 创建meta信息
 * @param handler
 * @param callback
 */
exports.add = function(handler, callback) {

  var data = handler.params.data;

  var createExtend = function(done) {
    if (data.extend) {
      datarider.createExtendObject(handler.copy({ schemaName: "File", data: data }), function(err, extend) {
        done(err, extend);
      });
    } else {
      done(null, {});
    }
  };

  var saveMeta = function(extend, done) {
    data.extend = extend;
    new Ctrl(handler.copy({ data: data }), constant.MODULES_NAME_FILE, File).add(done);
  };

  sync.waterfall([createExtend , saveMeta], callback);
};

/**
 * 上传文件，直接操作GridFS，不生成META信息
 * @param handler
 * @param callback
 */
exports.upload = function(handler, callback) {
  sync.map(handler.params.files, function(file, next) {
    save(handler.code, file, next);
  }, callback);
};

/**
 * @desc 获取文件，先从File表获取meta信息，然后再从gridfs取文件内容
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回 file 内容:
 */
exports.getFile = function (handler, callback) {

  sync.waterfall([
    function(done) {
      new Ctrl(handler, constant.MODULES_NAME_FILE, File).get(function(err, meta) {
        if (err) {
          return done(new errors.db.Find());
        }
        done(err, meta);
      });
    },

    function(meta, done) {
      conn.nativeopen(handler.code, function (err, db) {
        if (err) {
          return done(new errors.db.Find());
        }
        done(err, db, meta);
      });
    },

    function(db, meta, done) {
      var fileId = new ObjectID(meta.fileId.toString());
      GridStore.exist(db, fileId, function (err, exists) {
        if (err || !exists) {
          db.close();
          return done(new errors.db.Find());
        }
        done(err, db, meta);
      });
    },

    function(db, meta, done) {
      var fileId = new ObjectID(meta.fileId.toString())
        , grid = new GridStore(db, fileId, constant.MOD_GRIDSTORE_MODE_READ);
      grid.open(function (err, grid) {
        if (err) {
          db.close();
          return done(new errors.db.Find());
        }

        done(err, db, meta, grid);
      });
    },

    function(db, meta, grid, done) {
      grid.seek(0, function (err, grid) {
        if (err) {
          db.close();
          return callback(new errors.db.Find());
        }
        done(err, db, meta, grid);
      });
    },

    function(db, meta, grid, done) {
      grid.read(function (err, data) {
        db.close();
        done(err, {
          filename: grid.filename,
          contentType: grid.contentType,
          length: grid.length,
          uploadDate: grid.uploadDate,
          fileData: data
        });
      });
    }
  ], callback);
};

/**
 * 将GridFS文件写到物理文件
 * @param handler
 * @param callback
 */
exports.writeFile = function(handler, callback) {

  new Ctrl(handler, constant.MODULES_NAME_FILE, File).get(function(err, meta) {
    if (err || !meta) {
      return callback(new errors.db.Find());
    }

    conn.nativeopen(handler.code, function(err, db) {

      var id = new ObjectID(meta.fileId.toString());
      GridStore.exist(db, id, function (err, exists) {
        if (err || !exists) {
          db.close();
          return callback(new errors.db.Find());
        }

        var store = new GridStore(db, id, constant.MOD_GRIDSTORE_MODE_READ);
        store.open(function(err, gs) {
          if (err) {
            db.close();
            return callback(new errors.db.Find());
          }

          var path = ph.join(handler.params.folder || conf.tmp, handler.params.name || meta.name)
            , fileStream = fs.createWriteStream(path)
            , gridStream = gs.stream(true);
          fileStream.on("close", function(err) {
            db.close();
            callback(err, path);
          });

          gridStream.pipe(fileStream);
        });
      });
    });
  });
};

/**
 * 打包指定的文件下载
 * @param req
 * @param res
 */
exports.zip = function(req, res) {

  var handler = new context().bind(req, res);
  new Ctrl(handler, constant.MODULES_NAME_FILE, File).getList(function(err, result) {

    var files = [];
    async.forEach(result.items, function(item, done) {

      exports.writeFile(handler.copy({id: item._id}), function(err, result) {
        files.push(result);
        done(err);
      });
    }, function() {

      var zipName = handler.params.fileName || "archive.zip"
        , zip = ph.join(conf.tmp, zipName);

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(zipName));
      helper.zipFiles(files, zip, function() {
        fs.createReadStream(zip).pipe(res);
        _.each(files, function(f) {
          fs.unlinkSync(f);
        });
      });
    });
  });
};

/**
 * 生成QRcode
 * @param req
 * @param res
 */
exports.qrcode = function(req, res) {

  var qrName = helper.uuid()
    , qr = ph.join(conf.tmp, qrName)
    , handler = new context().bind(req, res);

  helper.qrcode(handler.message || qrName, qr, function() {
    var files = [{
      originalFilename: qrName,
      headers: {"content-type": "image/png"},
      path: qr
    }];

    handler.addParams("files", files);
    exports.create(handler, function(err, result) {
      fs.unlinkSync(qr);
      response.send(res, err, result);
    });
  });
};

/**
 * 下载文件
 * @param req
 * @param res
 * @returns {*}
 */
exports.download = function(req, res) {

  var handler = new context().bind(req, res);

  var params = handler.params
    , fileId = params.id || params.fileId;

  if (_.str.isBlank(fileId)) {
    return res.status(404).end();
  }

  handler.addParams("id", fileId);
  exports.getFile(handler, function(err, data) {

    // 返回错误信息
    if (err) {
      return res.status(404).end();
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", data.length);

    var userAgent = (req.headers['user-agent']||'').toLowerCase();
    if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
      /* ie chrome */
      res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(data.filename));
    } else if(userAgent.indexOf('firefox') >= 0) {
      /* firefox */
      res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(data.filename)+'"');
    } else {
      /* safari等其他非主流浏览器 */
      res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(data.filename).toString('binary'));
    }

    return res.send(data.fileData);
  });
};

exports.image = function (req, res) {

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
      {type: constant.OBJECT_TYPE_USER, item: "createBy"},
      {type: constant.OBJECT_TYPE_USER, item: "updateBy"}
    ],
    additions: { user: ["id", "name"]}
  };

  type.getOptions(handler, define, result.items || result, function(err, users) {
    (result._doc || result).options = {user: users};
    callback(err, result);
  });
}

