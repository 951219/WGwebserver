const puppeteer = require('puppeteer');

async function scrapeDefinition(word) {
    var url = 'http://eki.ee/dict/ekss/index.cgi?Q=' + word + '&F=M';
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const text = await page.evaluate(() => document.querySelector('.d').textContent);
        //works for words with a single definition

        browser.close()

        console.log({
            text
        });
        return text;

    } catch (error) {
        console.log(error + '\nelement not found')
    }
}

module.exports = {
    scrapeDefinition
}