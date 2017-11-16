[![Github Releases](https://img.shields.io/npm/l/express.svg)](https://github.com/wonder-sy0618/frame_rpc)
[![Build Status](https://travis-ci.org/wonder-sy0618/frame_rpc.svg?branch=master)](https://travis-ci.org/wonder-sy0618/frame_rpc)
# frame_rpc
An iframe-based rpc communication tool based on postMessage / onMessage


## example 
in frame page
``` javascript
window.frameRpc.listener("post_your_name", function(msg) {
  console.log("on post_your_name : " + msg.name);
  return {
    "welcome_message" : "hello " + msg.name
  }
});
```
in top page
``` javascript
window.frameRpc.send({
  type : "post_your_name",
  name : "demo"
}).then(function(revc) {
  console.log("on revc : " + revc.welcome_message);
});
```
run in browser
``` console
on post_your_name : demo
on revc : hello demo
```
