/**
 * @file 常量定义类
 * @author r2space@gmail.com
 */

"use strict";

/**
 * 共同常量
 */
exports.VALID    = 1;
exports.INVALID  = 0;
exports.ADMIN_ID = "000000000000000000000000";

/** 缺省的多国语言分类 */
exports.DEFAULT_I18N_LANG = "en";
exports.DEFAULT_I18N_CATEGORY = "light";

exports.DEFAULT_USER = "-";
exports.DEFAULT_TAG = "light";
exports.DEFAULT_COUNTER = "light";

exports.HEADER_UID_NAME = "userid";

/**
 * Modules层用常量
 */
// the number of documents to skip
exports.MOD_DEFAULT_START = 0;
// 检索件数的默认值
exports.MOD_DEFAULT_LIMIT = 20;
// デフォルトソート
exports.MOD_DEFAULT_SORT = { _id: -1 };

// write in truncate mode. Existing data will be Overwrite.
exports.MOD_GRIDSTORE_MODE_WRITE = "w";
// read only. This is the default mode.
exports.MOD_GRIDSTORE_MODE_READ = "r";


/** 组类型 */
exports.GROUP_TYPE_DEPARTMENT = "1"; // 部门（公司组织结构）
exports.GROUP_TYPE_GROUP = "2"; // 组（自由创建）
exports.GROUP_TYPE_OFFICIAL = "3"; // 职位组

/** 组可见性 */
exports.GROUP_VISIBILITY_PRIVATE = "1"; // 私密
exports.GROUP_VISIBILITY_PUBLIC = "2"; // 公开

exports.ACLINK_TYPE_USER_PERMISSION = "1";

exports.MODULES_NAME_ACLINK         = "ACLink";
exports.MODULES_NAME_FILE           = "File";
exports.MODULES_NAME_GROUP          = "Group";
exports.MODULES_NAME_CATEGORY       = "Category";
exports.MODULES_NAME_USER           = "User";
exports.MODULES_NAME_I18N           = "I18n";
exports.MODULES_NAME_COMPANY        = "Company";
exports.MODULES_NAME_HCHECK         = "HCheck";
exports.MODULES_NAME_EXTEND         = "Extend";
exports.MODULES_NAME_GRANT          = "Grant";
exports.MODULES_NAME_USERINFO       = "Userinfo";
exports.MODULES_NAME_FILTER         = "Filter";
exports.MODULES_NAME_TICKET         = "Ticket";
exports.MODULES_NAME_VOCABULARY     = "vocabulary";
exports.MODULES_NAME_MESSAGE        = "Message";
exports.MODULES_NAME_ETL            = "ETL";
exports.MODULES_NAME_ETLDATA        = "ETLData";
exports.MODULES_NAME_TAG            = "Tag";
exports.MODULES_NAME_MACHINE        = "Machine";
exports.MODULES_NAME_MIDDLEWARE     = "Middleware";
exports.MODULES_NAME_MONITOR_GRAPH  = "MonitorGraph";
exports.MODULES_NAME_BACKUP         = "Backup";
exports.MODULES_NAME_BACKUP_HISTORY = "BackupHistory";
exports.MODULES_NAME_MONITOR_ITEM   = "MonitorItem";
exports.MODULES_NAME_MONITOR_ZABBIX = "MonitorZabbix";
exports.MODULES_NAME_CRON           = "Cron";
exports.MODULES_NAME_FILE           = "File";

exports.MODULES_NAME_FUNCTION       = "Function";
exports.MODULES_NAME_AUTHORITY      = "Authority";
exports.MODULES_NAME_ROLE           = "Role";
exports.MODULES_NAME_PLACE          = "Place";
exports.MODULES_NAME_SETTING        = "Setting";
exports.MODULES_NAME_COUNTER        = "Counter";
exports.MODULES_NAME_DEVELOPER      = "Developer";

exports.MODULES_NAME_TEMPLATE       = "Template";
exports.MODULES_NAME_APP            = "App";
exports.MODULES_NAME_DEVICE         = "Device";

/** HealthCheck的状态 */
exports.STATUS_OK                   = "OK";
exports.STATUS_NG                   = "NG";
exports.STATUS_UNKNOWN              = "UNKNOWN";

exports.FILE_CONF_ROUTE_YAML        = "/routes.yaml";

exports.SYSTEM_DB                     = "LightDB";


exports.MODULES_NAME_DATASTORE_PREFIX = "Light.";
exports.MODULES_NAME_DATASTRUT        = "Light.Structure";
exports.MODULES_NAME_DATABOARD        = "Light.Board";

exports.PATH_CONTROLLER               = "/controllers/";

exports.OBJECT_TYPE_USER              = "1";
exports.OBJECT_TYPE_GROUP             = "2";
exports.OBJECT_TYPE_CATEGORY          = "3";
exports.OBJECT_TYPE_FILE              = "4";