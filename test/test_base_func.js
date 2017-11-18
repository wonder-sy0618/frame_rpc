
const puppeteer = require('puppeteer');
const assert = require('assert');

describe("测试基本的top与第一层iframe间的通信功能", function() {

    const pageurl = 'http://127.0.0.1:8080/example/universal_page/index.html';
    const testMessage = "the test message";

    let browerHandler;
    let pageHandler;

    before(async() => {

        browerHandler = await puppeteer.launch({
            //    headless: false,
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
        browerHandler.close();
    });

    it('断言inframe中接收到的消息', async() => {
        let frame_massge = await pageHandler.evaluate(() => document.inframe.document.querySelector(".message_box ul li").textContent);
        assert.equal(frame_massge, testMessage);
    });

    it('断言top内接收到的回复消息展示', async() => {
        let revc_message = await pageHandler.evaluate(() => document.getElementById("revc_message").textContent);
        assert.equal(revc_message, "hello : " + testMessage);
    })



});





