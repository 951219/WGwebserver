const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');


router.get('/ekilex/:word', async (req, res) => {

    let word = await getWord(req.params.word);
    let details = await getDefinitions(word);

    res.json({
        word: word,
        details: details
    })

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



//TODO pull word IDs from ekilex
//TODO pull definitions with IDs from ekilex and create a word to return

async function getWord(reqWord) {
    const url = `https://ekilex.eki.ee/api/word/search/${reqWord}/sss`;

    let word;;
    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
        const json = await fetch_response.json();
        word = json;
        console.log('Success - got the word from ekilex');
    } catch (err) {
        return { message: err.message };
    }
    return word;
}



async function getDefinitions(word) {
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

module.exports = router;

/*
Returns word id by Word from EKI API - https://ekilex.eki.ee/api/word/search/{word}/sss  - sss - EKI sõnastik 2020
Returns definitions by word it from EKI API - https://ekilex.eki.ee/api/word/details/{wordID}
ekilex-api-key as a header is necessary for both

1. Getting the word id by word - https://ekilex.eki.ee/api/word/search/{word}/sss
2. Getting the definitions by word id - https://ekilex.eki.ee/api/word/details/{wordID}
    a. "lexemes[]"
    b. igaühel"meaning{}"
    c. igal objectil  definitions[]
    d. igal objectil value
3. Create a word object

Getting the examples by word id ????
*/