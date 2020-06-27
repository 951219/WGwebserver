var fs = require('fs');
const scrapers = require('./scrapers');
const db = require('diskdb');

db.connect('./data', ['wordsNew']);
db.connect('./data', ['unusedIndexes']);

fs.readFile('wordsOld.txt', 'utf8', async function (error, data) {

    var lines = data.split('\n');

    for (var line = 0; line < 10; line++) {

        var sLine = lines[line];
        sLine = sLine.split(' /// ');

        const word = {
            id: line,
            tries: sLine[0],
            word: sLine[1],
            definition: sLine[2]
        };

        console.log(`loop ${line} - Sent to scraping: ${word.word}`);

        if (db.wordsNew.findOne({
                word: word.word
            }) === undefined) {

            var scrapedWord = await scrapers.scrapeWordFromEKI(word.word);

            scrapedWord["index"] = line;

            console.log(scrapedWord);
            db.wordsNew.save(scrapedWord);

        } else {
            db.unusedIndexes.save({
                id: line
            })
            console.log(`Duplicate word ${word.word}, ${line} id added to id DB`);
        }
    }
});