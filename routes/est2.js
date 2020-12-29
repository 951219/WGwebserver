const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');


router.get('/ekilex/:word', async (req, res) => {
    let reqWord = await getWord(req.params.word);
    let details = await getWordDetails(reqWord);
    let completedWord = await createAWord(details);

    res.json(
        completedWord
    );

});

// async function getWord(req, res, next) {
//     let word;
//     try {
//         word = await Word.findById(req.params.id);
//         if (word == null) {
//             return res.status(404).json({ message: "Cannot find the word" });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
//     res.word = word;
//     next();
// }

// async function postWord(data) {
//     const newWord = new Word({
//         word: data.word,
//         definition: data.definition,
//         example: data.example,
//         score: data.score
//     });

//     try {
//         const postingWord = await newWord.save();
//         console.log(postingWord);
//         return {
//             added: true,
//             message: postingWord
//         };
//     } catch (err) {
//         return {
//             added: false,
//             message: "could not save it"
//         };
//     }
// }

// 1. Getting the word id by word - https://ekilex.eki.ee/api/word/search/{word}/sss
async function getWord(reqWord) {
    const url = `https://ekilex.eki.ee/api/word/search/${encodeURI(reqWord)}/sss`;

    let word;;
    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } }).catch(err => console.error(err));
        const json = await fetch_response.json();
        word = json;
        console.log('Success - got the word from ekilex');
    } catch (err) {
        return { message: err.message };
    }
    return word;
}

// 2. Getting the definitions by word id - https://ekilex.eki.ee/api/word/details/{wordID}
async function getWordDetails(word) {
    const url = `https://ekilex.eki.ee/api/word/details/${word["words"][0]["wordId"]}`;

    let wordDetails;
    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
        const json = await fetch_response.json();
        wordDetails = json;
        console.log('Success - got the word details from ekilex');
    } catch (err) {
        return { message: err.message };
    }
    return wordDetails;
}

// 3. Create a word object
// a. "lexemes[]"
// b. igaühel"meaning{}"
// c. igal objectil  definitions[]
// d. igal objectil value
async function createAWord(wordDetails) {
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

module.exports = router;

// TODO getting the score and id from mongo
// TODO another endpoints could be used? There would be less irrelevant data to work with
/*
 https://ekilex.eki.ee/api/meaning/search/profülaktiline
 https://ekilex.eki.ee/api/meaning/details/82513
*/