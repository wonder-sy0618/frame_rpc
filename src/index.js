
const listener = require("./listener.js");
const sender = require("./sender.js");
const syslisten = require("./syslisten");

// 注册默认监听
syslisten();

// 导出公共方法
module.exports = {
  listener : listener,
  sender : sender
};
