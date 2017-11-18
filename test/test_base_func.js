
const puppeteer = require('puppeteer');
const assert = require('assert');
const sleepPromise = require("sleep-promise");
const debug = false;

describe("测试基本的top与第一层iframe间的通信功能", function() {

    const pageurl = 'http://127.0.0.1:8080/example/universal_page/index.html';
    const testMessage = "the test message";

    let browerHandler;
    let pageHandler;

    before(async() => {

        browerHandler = await puppeteer.launch({
            headless: !debug,
            args: ['--no-sandbox']
        });

        pageHandler = await browerHandler.newPage();
        await pageHandler.goto(pageurl, {
            waitUntil: 'networkidle2', // 等待网络状态为空闲的时候才继续执行
        });

        // 设置top
        await pageHandler.evaluate((pageurl) => {
            $("body")
                .append('<div><input type="text" name="message" id="input_message" /><button id="btn_send" >send</button><div id="revc_message" ></div></div>')
                .append('<iframe src="'+pageurl+'" name="inframe" ></iframe>');
            $("#btn_send").click(function() {
                let message = $("input[name=message]").val();
                window.frameRpc.sender({
                    type : "show_message",
                    content : message
                }, $("iframe[name=inframe]")[0].contentWindow).then(function(revc) {
                    $("#revc_message").empty().append(revc.content);
                    $("input[name=message]").val("");
                })
            });
            return new Promise((resolve, reject) => $("iframe[name=inframe]")[0].onload = resolve)
        }, pageurl);

        // 设置iframe
        await pageHandler.frames().find(f => f.name() === 'inframe').evaluate(() => {
            $("body").append('<div class="message_box" ><ul></ul></div>');
            window.frameRpc.listener("show_message", function(msg) {
                $(".message_box ul").prepend("<li>"+msg.content+"</li>");
                return {
                    "content" : "hello : " + msg.content
                }
            });
        });

        // 触发发送消息
        await pageHandler.type('#input_message', testMessage);
        await pageHandler.click("#btn_send");
    });

    after(function() {
        if (!debug) browerHandler.close();
    });

    it('断言inframe中接收到的消息', async() => {
        let frame_massge = await pageHandler.evaluate(() => document.inframe.document.querySelector(".message_box ul li").textContent);
        assert.equal(frame_massge, testMessage);
    });

    it('断言top内接收到的回复消息展示', async() => {
        let revc_message = await pageHandler.evaluate(() => document.getElementById("revc_message").textContent);
        assert.equal(revc_message, "hello : " + testMessage);
    });

    it('测试top->iframe使用iframe的name作为target参数发送', async() => {
        let message = "name target test, top->iframe";
        // 发送消息并验证返回结果
        await pageHandler.evaluate((message) => {
            return window.frameRpc.sender({
                type : 'show_message',
                content : message
            }, "inframe").then(function(msg) {
                return msg;
            })
        }, message).then(msg => assert.equal(msg.content, "hello : " + message));
        // 验证iframe内容
        await pageHandler.frames().find(f => f.name() === 'inframe').evaluate(() => {
            return $(".message_box ul li").first().text()
        }).then(testMessage => assert.equal(testMessage, message));
    });

    it('测试iframe->top使用iframe的name作为target参数发送', async() => {
        const message = "name target test, iframe->top";
        const messageType = "iframe_2_top_test";
        const messageRevc = "i received";
        // 发送消息并验证返回结果
        pageHandler.evaluate((messageType, messageRevc) => {
            return new Promise(resolve => {
                window.frameRpc.listener(messageType, function(msg) {
                    resolve(msg);
                    return messageRevc
                });
            })
        }, messageType, messageRevc).then(msg => assert.equal(msg.content, message));
        await sleepPromise(20);
        // 验证iframe内容
        await pageHandler.frames().find(f => f.name() === 'inframe').evaluate((messageType, message) => {
            window.frameRpcConfig = {debug : true};
            return window.frameRpc.sender({
                type : messageType,
                content : message
            })
        }, messageType, message).then(textMessage => assert.equal(textMessage, messageRevc));
    });



});





