
const commons = require("./commons.js");
const listener = require("./listener.js");

module.exports = function() {

    // 监听回调事件消息
    listener(commons.msgtype.sys_event_callback_msg_send, function (msg) {
        if (msg && msg.srcMsgId && commons.senderCallbackMap[msg.srcMsgId]) {
            //
            let parmar = msg.parmar ? JSON.parse(msg.parmar) : undefined;
            //
            commons.senderCallbackMap[msg.srcMsgId](parmar);
            delete commons.senderCallbackMap[msg.srcMsgId];
        }
    });

};
