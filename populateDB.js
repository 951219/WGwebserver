const runningInDevelopement = (process.env.NODE_ENV !== 'production');
if (runningInDevelopement) require('dotenv/config');
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true });
const mongodb = mongoose.connection;
mongodb.on('error', (error) => { console.log(error) });
mongodb.once('open', () => { console.log('Connected to MongoDB!') });
const fetch = require('node-fetch');

const oldWord = require('./models/estWord');
const newWord = require('./models/newEstWord');
// var wordsWithError = [];

// (async function () {
//     var words = await oldWord.find();
//     words.forEach(async (element) => {

//         await doit(element);
//         console.log(element.word);
//     });
//     console.log(wordsWithError);
// }());

(async function () {
    var words = await oldWord.find();
    words.forEach(async (element) => {
        let responseWord = await newWord.find({
            word: element.word
        });
        if (responseWord.length == 0) {
            await doit(element);
            console.log(element.word);
        }
    });
}());




async function doit(element) {
    let ekilexWord = await searchEkilexForAWord(element.word);
    try {
        if (ekilexWord['words']) {
            let data = await getWordDetails(ekilexWord);
            let completedWord = await createAWordFromEkilexData(data);
            await postWordToDB(completedWord);
        }
    } catch (err) {
        console.log(element);
        console.log(err.message);
    }
}
async function searchEkilexForAWord(queryWord) {

    const url = `https://ekilex.eki.ee/api/word/search/${encodeURI(queryWord)}/sss`;

    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } }).catch((err) => {
            return {
                message: `No such word found: ${queryWord}`,
                error: err.message
            }
        });
        const json = await fetch_response.json();

        if (json['totalCount'] == 0) {


        } else {

            return json;
        }
    } catch (err) {
        console.error({
            error: err,
            method: searchEkilexForAWord(),
            word: queryWord
        });
    }

}

// 2. Getting the definitions by word id - https://ekilex.eki.ee/api/word/details/{wordID}
async function getWordDetails(word) {
    const url = `https://ekilex.eki.ee/api/word/details/${word["words"][0]["wordId"]}`;

    let wordDetails;
    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
        const json = await fetch_response.json();
        wordDetails = json;

    } catch (err) {
        wordsWithError.push(word);
        console.error({
            error: err,
            method: getWordDetails(),
            word: word
        });
    }
    return wordDetails;
}

// 3. Create a word from word Details
async function createAWordFromEkilexData(wordDetails) {
    let wordId = wordDetails["lexemes"][0]["wordId"];
    let word = wordDetails["lexemes"][0]["wordValue"];
    let definitions = [];
    let examples = [];

    let lexemes = wordDetails["lexemes"];

    lexemes.forEach(element => {
        element["meaning"]["definitions"].forEach(item => {
            definitions.push(item["value"]);
        })
    });

    lexemes.forEach(element => {
        element["usages"].forEach(item => {
            examples.push(item["value"]);
        })
    });

    return { wordId, word, definitions, examples };
}





async function postWordToDB(wordObject) {

    const ss = new newWord({
        wordId: wordObject.wordId,
        word: wordObject.word,
        meaning: wordObject.definitions,
        example: wordObject.examples,
        timeAdded: Date.now()
    });

    try {
        await ss.save();
    } catch (err) {
        console.error({
            error: err,
            method: postWordToDB(),
            word: ss.word
        });
    }


}


