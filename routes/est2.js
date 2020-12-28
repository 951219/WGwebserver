const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');


router.get('/ekilex/:word', async (req, res) => {
    const url = `https://ekilex.eki.ee/api/word/search/${req.params.word}/sss`;
    console.log(url);
    const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
    const json = await fetch_response.json();
    res.json(json);

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

async function getWord(req, res, next) {
    let word;
    try {
        // const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
        // const json = await fetch_response.json();
        // res.json(json);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.word = word;
    next();
}

module.exports = router;

/*
Returns word id by Word from EKI API - https://ekilex.eki.ee/api/word/search/{word}/sss  - sss - EKI sõnastik 2020
Returns definitions by word it from EKI API - https://ekilex.eki.ee/api/word/details/{wordID}
ekilex-api-key as a header is necessary for both
*/