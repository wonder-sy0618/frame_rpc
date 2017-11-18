
const commons = require("./commons.js");
const cuid = require("cuid");
const msgserial = require("./msgserial");


module.exports = function(message, target) {
    // 参数容错
    if (!message) {
        message = {};
    }
    if (!message.type) {
        throw "error parmar, message.type is required"
    }
    if (!target) {
        target = window.top;
    }
    if (typeof(target) == 'string') {
        let frame = commons.loadFrameByName(target);
        target = frame.contentWindow;
    }
    if (!target || !target.postMessage) {
        target = window.top;
    }
    if (!message.msgId || message.msgId.length <= 0) {
        message.msgId = cuid();
    }
    if (window === top.window) {
        message.msgSrcFrameName = 'top'
    } else if (window.name && window.name.length > 0) {
        message.msgSrcFrameName = window.name;
    } else {
        console.warn("unable get window.name, promise callback is not support!")
    }
    //
    if (commons.loadDebugStatus()) {
        console.log("send message", message, window.location.href)
    }
    let stringMessage = msgserial.serialization(message);
    target.postMessage(stringMessage, "*");
    // 注册回调
    return new Promise(function(resolve) {
        commons.senderCallbackMap[message.msgId] = resolve;
    })
};