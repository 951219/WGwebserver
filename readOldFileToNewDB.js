var fs = require('fs');
const scrapers = require('./scrapers');
const db = require('diskdb');
var words = [];

db.connect('./data', ['wordsNew']);

fs.readFile('wordsOld.txt', 'utf8', async function (error, data) {

    var lines = data.split('\n');

    for (var line = 0; line < 15; line++) {

        var sLine = lines[line];
        sLine = sLine.split(' /// ');

        const word = {
            id: line,
            tries: sLine[0],
            word: sLine[1],
            definition: sLine[2]
        };

        console.log(`loop ${line} - Sent to scraping: ${word.word}`);

        const item = db.wordsNew.findOne({
            word: word.word
        })

        if (item === undefined) {

            var scrapedWord = await scrapers.scrapeWordFromEKI(word.word);

            console.log(scrapedWord);
            words.push(scrapedWord);
            db.wordsNew.save(scrapedWord);

        } else {
            console.log(`Duplicate word ${word.word}, not added`);
        }
    }

    console.log(words.length);

});