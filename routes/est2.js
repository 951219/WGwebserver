const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/newEstWord');

router.get('/ekilex/:word', getWord, (req, res) => {
});

// 1. Getting the word id by word - https://ekilex.eki.ee/api/word/search/{word}/sss
async function searchEkilexForAWord(queryWord) {
    console.log(`Querying ekilex for word ${queryWord}`);
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
            console.error(`Failure -> searchEkilexForAWord() -> Total count for word ${queryWord}: ${json['totalCount']}`)
            return { message: `No such word found: ${queryWord}` }
        } else {
            console.log(`Success -> searchEkilexForAWord() -> total count for word ${queryWord}: ${json['totalCount']}`);
            return json;
        }
    } catch (err) {
        return { message: err.message };
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
        console.log(`Success -> getWordDetails() -> got the word details from ekilex`);
    } catch (err) {
        return { message: err.message };
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

async function postWordToDB(ekilexData) {
    console.log(`Posting word ${ekilexData.word} to DB`);

    const newWord = new Word({
        wordId: ekilexData.wordId,
        word: ekilexData.word,
        meaning: ekilexData.definitions,
        example: ekilexData.examples,
        timeAdded: Date.now()
    });

    try {
        const postingWord = await newWord.save();
        console.log(`Word ${postingWord.word} posted to DB`);
        return {
            added: true,
            message: postingWord
        };
    } catch (err) {
        return {
            added: false,
            message: "could not save it",
            error: err.message
        };
    }
}


async function getWord(req, res, next) {
    let requestedWord = req.params.word;
    let responseWord;
    try {
        responseWord = await Word.find({
            word: requestedWord
        });
        if (responseWord.length == 0) {
            console.log(`Cannot find the word ${requestedWord} from DB`);
            let ekilexWord = await searchEkilexForAWord(requestedWord);
            if (ekilexWord['words']) {
                let data = await getWordDetails(ekilexWord);
                let completedWord = await createAWordFromEkilexData(data);
                postWordToDB(completedWord);
                res.json(
                    completedWord
                );
            } else {
                return res.status(500).json({ message: ekilexWord.message });
            }
            // return res.status(404).json({ message: "Cannot find the word" });
        } else {
            console.log(`Found the word ${req.params.word} from DB and returning it`);
            res.status(200).json(responseWord);
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    next();
}

module.exports = router;

// TODO another endpoints could be used? There would be less irrelevant data to work with

/*
 https://ekilex.eki.ee/api/meaning/search/profülaktiline
 https://ekilex.eki.ee/api/meaning/details/82513
*/