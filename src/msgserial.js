/**
 * 负责消息对象与字符串的转换
 */

const commons = require("./commons.js");

module.exports = {

    // 序列化
    serialization : function (message) {
        try {
            return commons.msgPrefix + JSON.stringify(message);
        } catch (e) {
            throw "In the process of sending the message, JSON.stringify faild, maybe message objects are not serializable.";
        }
    },

    // 反序列化
    deserialization : function(strmsg) {
        return JSON.parse(strmsg.substring(commons.msgPrefix.length, strmsg.length));
    }

};