
const commons = require("./commons.js");
const sender = require("./sender.js");

module.exports = function(type, fn) {
    if (!type || !fn) {
        throw "listener error parmar, type and fn is required"
    }
    if (commons.loadDebugStatus()) {
        console.log("[tofun] [message] add listener", type, window.location.href)
    }
    window.addEventListener('message', function (e) {
        if (!e.data || !e.data.indexOf || e.data.indexOf(commons.msgPrefix) != 0) {
            return;
        }
        let message = JSON.parse(e.data.substring(commons.msgPrefix.length, e.data.length));
        if (commons.loadDebugStatus()) {
            console.log("[message] recv message", message, type, message.msgSrcFrameName + " -> " + window.location.href)
        }
        if (message.type == type) {
            // 调用已经注册的方法
            let promise = fn(message, e);
            // 回调
            if (message.type != commons.msgtype.sys_event_callback_msg_send
                && message.msgSrcFrameName && message.msgSrcFrameName.length > 0) {
                // 获取来源对象
                // 因为postMessage机制的限制，无法使用事件获取来源对象
                let messageSrcWindow;       // 消息发送来源
                if (commons.loadFrameByName(message.msgSrcFrameName)) {
                    messageSrcWindow = commons.loadFrameByName(message.msgSrcFrameName).contentWindow;
                } else {
                    messageSrcWindow = top.window;
                }
                // 通知
                if (promise && promise.then) {
                    // 异步模式，使用promise回调
                    promise.then(function(parmar) {
                        sender({
                            type : commons.msgtype.sys_event_callback_msg_send,
                            srcMsgId : message.msgId,
                            parmar : promise ? JSON.stringify(parmar) : undefined
                        }, messageSrcWindow)
                    })
                } else {
                    // 同步模式
                    sender({
                        type : commons.msgtype.sys_event_callback_msg_send,
                        srcMsgId : message.msgId,
                        parmar : promise ? JSON.stringify(promise) : undefined
                    }, messageSrcWindow)
                }
            }
        }
    }, false, 100)
};