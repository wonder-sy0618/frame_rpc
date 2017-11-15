
const cuid = require("cuid")
const $ = require("jquery")
const msgPrefix = "rpc_"
const debug = function() {
  return window.frameRpcConfig && window.frameRpcConfig.debug == true ? true : false;
}

const msgtype = {

  // 消息回调通知
  // 实现异步调用返回
  sys_event_callback_msg_send : "sys_event_callback_msg_send",

  // 消息转发
  // iframe是无法直接与另一个iframe通信的，因为top可能与本iframe不同域
  // 这种类型是为top增加一个转发动作，由top转发两个iframe之间的通信
  // 也可以作为iframe转发给他的子iframe
  sys_action_message_forward : "sys_action_message_forward"

}


const listener = function(type, fn) {
    if (!type || !fn) {
        throw "listener error parmar, type and fn is required"
    }
    if (debug()) {
      console.log("[tofun] [message] add listener", type, window.location.href)
    }
    window.addEventListener('message', function (e) {
        if (!e.data || !e.data.indexOf || e.data.indexOf(msgPrefix) != 0) {
            return;
        }
        var message = JSON.parse(e.data.substring(msgPrefix.length, e.data.length));
        if (debug()) {
          console.log("[message] recv message", message, type, message.msgSrcFrameName + " -> " + window.location.href)
        }
        if (message.type == type) {
            // 调用已经注册的方法
            var promise = fn(message, e);
            // 回调
            if (message.type != msgtype.sys_event_callback_msg_send
                    && message.msgSrcFrameName && message.msgSrcFrameName.length > 0) {
                // 获取来源对象
                // 因为postMessage机制的限制，无法使用事件获取来源对象
                var messageSrcWindow;       // 消息发送来源
                if ($("iframe[name="+message.msgSrcFrameName+"]").length > 0) {
                    messageSrcWindow = $("iframe[name="+message.msgSrcFrameName+"]")[0].contentWindow;
                } else {
                    messageSrcWindow = top.window;
                }
                // 通知
                if (promise && promise.then) {
                    // 异步模式，使用promise回调
                    promise.then(function(parmar) {
                        sender({
                            type : msgtype.sys_event_callback_msg_send,
                            srcMsgId : message.msgId,
                            parmar : promise ? JSON.stringify(parmar) : undefined
                        }, messageSrcWindow)
                    })
                } else {
                    // 同步模式
                    sender({
                        type : msgtype.sys_event_callback_msg_send,
                        srcMsgId : message.msgId,
                        parmar : promise ? JSON.stringify(promise) : undefined
                    }, messageSrcWindow)
                }
            }
        }
    }, false, 100)
}


// 消息发送回调注册，msgId : fn
const senderCallbackMap = {}

const sender = function(message, target) {
    // 参数容错
    if (!message) {
        message = {};
    }
    if (!message.type) {
      throw "error parmar, message.type is required"
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
    if (debug()) {
      console.log("send message", message, window.location.href)
    }
    var stringMessage;
    try {
      stringMessage = msgPrefix + JSON.stringify(message);
    } catch (e) {
      throw "In the process of sending the message, JSON.stringify faild, maybe message objects are not serializable.";
    }
    target.postMessage(stringMessage, "*")
    // 注册回调
    return new Promise(function(resolve, reject) {
        senderCallbackMap[message.msgId] = resolve;
    })
}


listener(msgtype.sys_event_callback_msg_send, function (msg) {
    if (msg && msg.srcMsgId && senderCallbackMap[msg.srcMsgId]) {
        //
        var parmar = msg.parmar ? JSON.parse(msg.parmar) : undefined;
        //
        senderCallbackMap[msg.srcMsgId](parmar);
        delete senderCallbackMap[msg.srcMsgId];
    }
})


module.exports = {
  listener : listener,
  sender : sender
}
