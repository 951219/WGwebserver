const puppeteer = require('puppeteer');


//works for words with with multiple definitions and multiple examples
async function scrapeWordFromEKI(inWord) {
    var url = 'http://eki.ee/dict/ekss/index.cgi?Q=' + inWord + '&F=M';
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);



        // gets the found word to prevent typos in the url
        const word = await page.evaluate(() => document.querySelector('.leitud_ss').textContent);

        // checks if the word is a homonym(has multiple meanings) and adds them to array
        const definition = await page.evaluate(() => Array.from(document.querySelectorAll('.d'), e => e.textContent));


        // checks if example element is present, if it is then returns value, if not then null
        var example;
        try {
            await page.waitForSelector('.n', {
                timeout: 2000
            })
            example = await page.evaluate(() => Array.from(document.querySelectorAll('.n'), e => e.textContent));
        } catch (error) {
            example = null;
            console.log("The element '.n' didn't appear for " + word);
            console.log(error.message);
        }

        browser.close()

        console.log('Scraping successful'
            // , {
            //     word,
            //     definition,
            //     example,
            //     tries: 0
            // }

        );


        const wordNew = {
            word: word,
            definition: definition,
            example: example,
            tries: 0
        };

        return wordNew;

    } catch (error) {
        console.log(inWord + ' element not found \n' + error)
    }
}

module.exports = {
    scrapeWordFromEKI
}