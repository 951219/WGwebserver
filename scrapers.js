const puppeteer = require('puppeteer');

async function scrapeDefinition(word) {
    var url = 'http://eki.ee/dict/ekss/index.cgi?Q=' + word + '&F=M';
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const word = await page.evaluate(() => document.querySelector('.leitud_ss').textContent);
        const text = await page.evaluate(() => document.querySelector('.d').textContent);
        const example = await page.evaluate(() => document.querySelector('.n').textContent);

        //if(element .c existsi){
        // const example2 = await page.evaluate(() => document.querySelector('.c').textContent);
        // const example2author = await page.evaluate(() => document.querySelector('.caut').textContent);

        // }
        //works for words with a single definition

        browser.close()

        console.log({
            word,
            text,
            example,
            // example2,
            // example2author
        });
        return {
            word,
            text,
            example,
            // example2,
            // example2author
        };

    } catch (error) {
        console.log(error + '\nelement not found')
    }
}

module.exports = {
    scrapeDefinition
}