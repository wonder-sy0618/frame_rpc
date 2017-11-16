[![Github Releases](https://img.shields.io/npm/l/express.svg)](https://github.com/wonder-sy0618/frame_rpc)
[![Build Status](https://travis-ci.org/wonder-sy0618/frame_rpc.svg?branch=master)](https://travis-ci.org/wonder-sy0618/frame_rpc)
# frame_rpc
简单的top页面与iframe页面间的RPC通讯工具


## example 
在需要通讯的top和iframe页面中，引入frameRpc.js
``` html
    <script type="text/javascript" src="./dist/frameRpc.js" ></script>
```
在iframe页面中，实现消息监听方法（服务）
``` javascript
window.frameRpc.listener("post_your_name", function(msg) {
  console.log("on post_your_name : " + msg.name);
  return {
    "welcome_message" : "hello " + msg.name
  }
});
```
在top页面中，实现消息发送方法（调用）
``` javascript
window.frameRpc.sender({
  type : "post_your_name",
  name : "demo"
}).then(function(revc) {
  console.log("on revc : " + revc.welcome_message);
});
```
在浏览器端运行，可以看到console有以下输出
``` console
on post_your_name : demo
on revc : hello demo
```
