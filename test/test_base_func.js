
const assert = require('assert');
const puppeteer = require('puppeteer');

describe("测试基本的top与第一层iframe间的通信功能", function() {

    it('第一次消息通讯', async() => {

        const pageurl = 'http://127.0.0.1:8080/example/base_func/index.html';
        const testMessage = "aaa";

        const browser = await puppeteer.launch({
        //           headless: false
        });
        try {

            const page = await browser.newPage();
            await page.goto(pageurl, {
                waitUntil: 'networkidle2', // 等待网络状态为空闲的时候才继续执行
            });

            // 触发发送消息
            await page.type('#input_message', testMessage);
            await page.click("#btn_send");

            // 断言inframe中接收到的消息
            let frame_massge = await page.evaluate(() => document.inframe.document.querySelector(".message_box ul li").textContent);
            assert.equal(frame_massge, testMessage);

            // 断言top内接收到的回复消息展示
            let revc_message = await page.evaluate(() => document.getElementById("revc_message").textContent);
            assert.equal(revc_message, "hello : " + testMessage);

        } finally {
            await browser.close();
        }

    });

});





