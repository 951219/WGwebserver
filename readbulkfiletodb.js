var fs = require('fs');
// const scrapers = require('./scrapers');
const db = require('diskdb');

db.connect('./data', ['words']);
// db.connect('./data', ['unusedIndexes']);
// db.connect('./data', ['lookInto']);

fs.readFile('./data/rawtext/estwordsinbulk.txt', 'utf8', async function (error, data) {

    var lines = data.split('\n');

    for (var line = 0; line < lines.length; line++) {

        const word = lines[line];

        // console.log(`working with word: ${word}`);



        //checks for duplicates
        if (db.words.findOne({
                word: word.word
            }) === undefined) {
            console.log(`new word  ${word}- not in db`);

            //     var scrapedWord = await scrapers.scrapeWordFromEKI(word.word);

            //     if (db.words.findOne({
            //             word: scrapedWord.word
            //         }) === undefined) {

            //         //checks for other anomalies
            //         if (scrapedWord.word != null) {

            //             scrapedWord["index"] = line.toString();

            //             console.log(scrapedWord);
            //             db.words.save(scrapedWord);

            //         } else {
            //             //if something is broken
            //             db.unusedIndexes.save({
            //                 word: word.word,
            //                 id: line

            //             })

            //             db.lookInto.save({
            //                 word: word.word,
            //                 ekiWord: scrapedWord.word,
            //                 id: line
            //             })

            //             console.log(`Something is broken: ${word.word} added to lookInto.json, index ${line} added to unusedIndexes.json`);

            //         }
            //     } else {
            //         // if duplicate found according to the EKI response

            //         db.lookInto.save({
            //             word: word.word,
            //             ekiWord: scrapedWord.word,
            //             id: line
            //         })
            //         db.unusedIndexes.save({
            //             word: word.word,
            //             id: line
            //         })
            //         console.log(`Duplicate word found, when it got corrected by EKI response: ${word.word} vs ${scrapedWord.word}, ${line} id added to id DB`);

            //     }

        } else {
            // if duplicate found
            // db.unusedIndexes.save({
            //     word: word.word,
            //     id: line
            // })
            console.log(`Duplicate word: ${word}`);
        }
    }
});