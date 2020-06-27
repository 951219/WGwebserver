
var fs = require('fs');
const scrapers = require('./scrapers');
const db = require('diskdb');
var words = [];

db.connect('./data', ['wordsNew']);

fs.readFile('wordsOld.txt', 'utf8', function (error, data) {

    var lines = data.split('\n');
    var line = 0;


    for (line; line < 10; line++) {

        var sLine = lines[line];
        sLine = sLine.split(' /// ');

        const word = {
            id: line,
            tries: sLine[0],
            word: sLine[1],
            definition: sLine[2]
        };

        console.log('Sent to scraping: ' + word.word);

        var scrapedWord = scrapers.scrapeWordFromEKI(word.word);
        words.push(scrapedWord);


        db.wordsNew.save(scrapedWord);
        //mida promiseiga edasi teha
    }

    // setTimeout(() => {
    //     db.wordsNew.save(words.forEach);
    // }, 10000);

    // console.log(words.length);

});