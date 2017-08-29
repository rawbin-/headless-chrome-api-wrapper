const puppeteer = require('puppeteer');

puppeteer.launch({
    headless:false
}).then(async browser => {
    const page = await browser.newPage();

    await page.goto('https://www.baidu.com');

    await page.evaluate(() => {
        const inputElement = document.getElementById('kw');
        inputElement.value = 'Web自动化 headless chrome';

        const submitElement = document.getElementById('su');
        submitElement.click();
    });
});