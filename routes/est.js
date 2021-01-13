const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/estWord');
const UserModel = require('../models/userModel');
const authorizeUser = require('./user').authorizeUser;

router.get('/get/:word', getWord, (req, res) => {
    addToUserDictionary(res.word, req.user.name);
    res.status(200).json(res.word);
});

//TODO: getting number of random entries from mongo, might contain duplicates
router.get('/random/:number', authorizeUser, async (req, res) => {
    var howmany = parseInt(req.params.number);
    let word = await Word.aggregate([{ $sample: { size: howmany } }]);
    res.status(200).json(word);
})

router.get('/getall/', authorizeUser, async (req, res) => {
    let words = await Word.find();
    res.status(200).json(words);
});

//TODO bundle for 1 round of guessing, pulling from the users Word db
router.get('/getuserwords/', authorizeUser, async (req, res) => {
    let words = await getUserWordObjects(req.user.name);
    res.status(200).json(words);
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

async function postWordToDB(wordObject) {
    console.log(`Posting word ${wordObject.word} to DB`);

    const newWord = new Word({
        wordId: wordObject.wordId,
        word: wordObject.word,
        meaning: wordObject.definitions,
        example: wordObject.examples,
        timeAdded: Date.now()
    });

    try {
        const postingWord = await newWord.save();
        console.log(`Word ${postingWord.word} posted to DB`);
    } catch (err) {
        console.error(`Failure -> postWordToDB() -> Word ${postingWord.word} was not added to DB\n ${err.message}`);
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
                await postWordToDB(completedWord);

                try {
                    console.log('checking from db again');
                    completedWord = await Word.find({
                        word: requestedWord
                    });
                    res.word = completedWord;
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            } else {
                return res.status(500).json({ message: ekilexWord.message });
            }
        } else {
            console.log(`Found the word ${req.params.word} from DB and returning it`);
            res.word = responseWord;
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    next();
}

async function addToUserDictionary(wordObject, username) {
    wordObject = wordObject[0];
    //1. get that user since you can only add, if you have an account
    let user = await UserModel.findOne({
        username: username
    });

    if (user !== null) {
        //2. check if they already have it
        let list = user.words;
        let found = list.find((element) => element.word_id == wordObject.wordId);
        if (found !== undefined) {
            console.log('User already has this word');
        } else {
            console.log('User does not have this word, adding it to db');
            list.push({
                word_id: wordObject.wordId,
                lang: 'est',
                word: wordObject.word,
                score: 0
            });
            try {
                await user.update({
                    words: list
                });
            } catch (err) {
                console.log(err.message);
            }
        }
    }
}

async function getUserWordObjects(user) {
    //TODO return 10 random word objects from user DB
}

module.exports = router;

// maybe another endpoints could be used? There would be less irrelevant data to work with
/*
 https://ekilex.eki.ee/api/meaning/search/profülaktiline
 https://ekilex.eki.ee/api/meaning/details/82513
*/