var fs = require('fs');
const scrapers = require('./scrapers');
const db = require('diskdb');

db.connect('./data', ['wordsNew']);
db.connect('./data', ['unusedIndexes']);
db.connect('./data', ['lookInto']);

fs.readFile('wordsOld.txt', 'utf8', async function (error, data) {

    var lines = data.split('\n');

    for (var line = 12; line < 20; line++) {

        var sLine = lines[line];
        sLine = sLine.split(' /// ');

        const word = {
            id: line,
            tries: sLine[0],
            word: sLine[1],
            definition: sLine[2]
        };

        console.log(`loop ${line} - Sent to scraping: ${word.word}`);

        //checks for duplicates
        if (db.wordsNew.findOne({
                word: word.word
            }) === undefined) {

            var scrapedWord = await scrapers.scrapeWordFromEKI(word.word);

            if (db.wordsNew.findOne({
                    word: scrapedWord.word
                }) === undefined) {

                //checks for other anomalies
                if (scrapedWord.word != null) {

                    scrapedWord["index"] = line;

                    console.log(scrapedWord);
                    db.wordsNew.save(scrapedWord);

                } else {
                    //if something is broken
                    db.unusedIndexes.save({
                        id: line
                    })

                    db.lookInto.save({
                        word: word.word
                    })

                    console.log(`Something is broken: ${word.word} added to lookInto.json, index ${line} added to unusedIndexes.json`);

                }
            } else {


                db.lookInto.save({
                    word: word.word
                })
                db.unusedIndexes.save({
                    id: line
                })
                console.log(`Duplicate word found, when it got corrected by EKI response: ${word.word} vs ${scrapedWord.word}, ${line} id added to id DB`);

            }

        } else {
            // if duplicate found
            db.unusedIndexes.save({
                id: line
            })
            console.log(`Duplicate word ${word.word}, ${line} id added to id DB`);
        }
    }
});