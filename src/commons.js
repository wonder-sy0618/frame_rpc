
const msgPrefix = "rpc_";

const msgtype = {

    // 消息回调通知
    // 实现异步调用返回
    sys_event_callback_msg_send : "sys_event_callback_msg_send",

    // 消息转发
    // iframe是无法直接与另一个iframe通信的，因为top可能与本iframe不同域
    // 这种类型是为top增加一个转发动作，由top转发两个iframe之间的通信
    // 也可以作为iframe转发给他的子iframe
    sys_action_message_forward : "sys_action_message_forward"

};

const loadDebugStatus = function() {
    return !!(window.frameRpcConfig && window.frameRpcConfig.debug == true);
};

// 通过iframe的name属性，获取iframe
const loadFrameByName = function(frameName) {
    let frameArray = [].slice.call(document.getElementsByTagName("iframe")).filter(item => {return item.name == frameName});
    if (frameArray && frameArray.length > 0) {
        return frameArray[0]
    }
};

// 消息发送回调注册，msgId : fn
const senderCallbackMap = {

};

module.exports = {
    msgPrefix : msgPrefix,
    msgtype : msgtype,
    loadDebugStatus : loadDebugStatus,
    loadFrameByName : loadFrameByName,
    senderCallbackMap : senderCallbackMap
};