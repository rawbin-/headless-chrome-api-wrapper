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

    // setTimeout(() => {
    //     page.evaluate(() => {
    //         let resultList = [];
    //         const linkBlocks = document.querySelectorAll('div.result.c-container');
    //         for (let block of Array.from(linkBlocks)) {
    //             let targetObj = block.querySelector('h3');
    //             resultList.push({
    //                 title: targetObj.textContent,
    //                 link: targetObj.querySelector('a').getAttribute('href')
    //             });
    //         }
    //         return resultList;
    //     }).then((searchResult) => {
    //         console.log(searchResult)
    //         browser.close();
    //     });
    // },3000);


    await page.waitForSelector('div.result.c-container').then(() => {
        page.evaluate(() => {
            let resultList = [];
            const linkBlocks = document.querySelectorAll('div.result.c-container');
            for (let block of Array.from(linkBlocks)) {
                let targetObj = block.querySelector('h3');
                resultList.push({
                    title: targetObj.textContent,
                    link: targetObj.querySelector('a').getAttribute('href')
                });
            }
            return resultList;
        }).then((searchResult) => {
            console.log(searchResult)
            browser.close();
        });
    })
});