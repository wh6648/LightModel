
/**
 * @file 对外接口定义
 * @author r2space@gmail.com
 */

"use strict";

module.exports = {

  user:         require("./lib/user"),
  group:        require("./lib/group"),
  file:         require("./lib/file"),
  company:      require("./lib/company/ctrl_company"),
  category:     require("./lib/category"),
  aclink:       require("./lib/aclink"),
  auth:         require("./lib/security"), // 废弃预定，请使用security
  security:     require("./lib/security"),
  func:         require("./lib/function"),
  setting:      require("./lib/setting"),
  role:         require("./lib/role"),
  place:        require("./lib/place"),
  authority:    require("./lib/authority"),
  board:        require("./lib/datarider/ctrl_board"),
  structure:    require("./lib/datarider/ctrl_structure"),
  datarider:    require("./lib/datarider/datarider"),
  template:     require("./lib/template"),
  ctrlData:     require("./lib/datarider/ctrl_data"),
  modData:      require("./lib/datarider/mod_data"),
  constant:     require("./lib/constant"),
  i18n:         require("./lib/i18n"),
  tag:          require("./lib/tag"),
  cron:         require("./lib/ops/cron"),
  log:          require("./lib/ops/log"),
  machine:      require("./lib/ops/machine"),
  middleware:   require("./lib/ops/middleware"),
  counter:      require("./lib/counter"),
  app:          require("./lib/app"),
  developer:    require("./lib/developer"),
  route:        require("./lib/route"),
  device:       require("./lib/device")
};

