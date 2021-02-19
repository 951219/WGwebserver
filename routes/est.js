const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/estWord');
const UserModel = require('../models/userModel');
const { authorizeUser } = require('./user');
const { getUserInfo } = require('./user');

const logger = require('pino')({
    prettyPrint: {
        levelFirst: true
    },
    prettifier: require('pino-pretty')
});


router.get('/get/:word', authorizeUser, getWord, (req, res) => {
    addToUserDictionary(res.word, req.user_id);
    res.status(200).json(res.word);
});

//TODO: getting number of random entries from mongo, might contain duplicates
router.get('/random/:number', authorizeUser, async (req, res) => {
    var howmany = parseInt(req.params.number);
    let word = await Word.aggregate([{ $sample: { size: howmany } }]);
    res.status(200).json(word);
});

router.get('/getall/', authorizeUser, async (req, res) => {
    let words = await Word.find();
    res.status(200).json(words);
});

//TODO broken - bundle for 1 round of guessing, pulling from the users Word db
router.get('/getuserwords/', authorizeUser, async (req, res) => {
    let userData = await getUserInfo(req.user_id);
    // let words = await getUserWordObjects(userData);
    res.status(200).json({ message: "broken" });
});

// 1. Getting the word id by word - https://ekilex.eki.ee/api/word/search/{word}/sss
async function searchEkilexForAWord(queryWord) {
    logger.info(`Querying ekilex for word ${queryWord}`);
    const url = `https://ekilex.eki.ee/api/word/search/${encodeURI(queryWord)}/sss`;

    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } }).catch((err) => {
            let response = {
                message: `No such word found: ${queryWord}`,
                error: err.message
            };

            logger.warn(response);
            return response;
        });
        const json = await fetch_response.json();

        if (json['totalCount'] == 0) {
            logger.warn(`Failure -> searchEkilexForAWord() -> Total count for word ${queryWord}: ${json['totalCount']}`);
            return { message: `No such word found: ${queryWord}` };
        } else {
            logger.info(`Success -> searchEkilexForAWord() -> total count for word ${queryWord}: ${json['totalCount']}`);
            return json;
        }
    } catch (err) {
        logger.error(err.message);
        return { message: err.message };
    };

};

// 2. Getting the definitions by word id - https://ekilex.eki.ee/api/word/details/{wordID}
async function getWordDetailsByWordId(wordId) {
    let url = `https://ekilex.eki.ee/api/word/details/${wordId}`;

    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
        const json = await fetch_response.json();
        logger.info(`Success -> getWordDetailsByWordId() -> got the word details from ekilex for ID ${wordId}`);
        return json;
    } catch (err) {
        logger.error(err.message);
        return { message: err.message };
    };

};
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
        });
    });

    lexemes.forEach(element => {
        element["usages"].forEach(item => {
            examples.push(item["value"]);
        });
    });

    return { wordId, word, definitions, examples };
};

async function postWordToDB(wordObject) {
    logger.info(`Posting word ${wordObject.word} to DB`);

    const newWord = new Word({
        wordId: wordObject.wordId,
        word: wordObject.word,
        meaning: wordObject.definitions,
        example: wordObject.examples,
        timeAdded: Date.now()
    });

    console.log(newWord);

    try {
        await newWord.save();
        logger.info(`Word ${newWord.word} posted to DB`);
    } catch (err) {
        logger.error(`Failure -> postWordToDB() -> Word ${newWord.word} was not added to DB\n ${err.message}`);
    };
};

async function getWord(req, res, next) {
    let requestedWord = req.params.word;
    let responseWord;
    try {
        responseWord = await Word.find({
            word: requestedWord
        });
        if (responseWord.length == 0) {
            logger.info(`Cannot find the word ${requestedWord} from DB`);
            let ekilexWord = await searchEkilexForAWord(requestedWord);
            if (ekilexWord['words']) {
                let wordId = ekilexWord["words"][0]["wordId"];
                //before this wordid part was in getWordDetailsByWordId()
                let data = await getWordDetailsByWordId(wordId);
                let completedWord = await createAWordFromEkilexData(data);
                await postWordToDB(completedWord);

                try {
                    logger.info('Checking from db again');
                    completedWord = await Word.find({
                        word: requestedWord
                    });
                    res.word = completedWord;
                } catch (err) {
                    logger.error(err.message);
                    return res.status(500).json({ message: err.message });
                };
            } else {
                logger.warn(ekilexWord.message);
                return res.status(500).json({ message: ekilexWord.message });
            };
        } else {
            logger.info(`Found the word ${req.params.word} from DB and returning it`);
            res.word = responseWord;
        };
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ message: err.message });
    };
    next();
}

async function addToUserDictionary(wordObject, userid) {
    wordObject = wordObject[0];
    //1. get that user since you can only add, if you have an account
    let user = await UserModel.findOne({
        user_id: userid
    });

    if (user !== undefined || user !== null) {
        //2. check if they already have it
        let list = user.words;
        let found = list.find((element) => element.word_id == wordObject.wordId);
        if (found !== undefined) {
            logger.info('User already has this word');
        } else {
            logger.info('User does not have this word, adding it to their db');
            list.push({
                word_id: wordObject.wordId,
                lang: 'est',
                word: wordObject.word,
                score: 0
            });
            try {
                await user.updateOne({
                    words: list
                });
            } catch (err) {
                logger.error(err.message);
            };
        };
    };
};

// async function getUserWordObjects(userObject) {
//     //TODO broken. return 10 random word objects from user DB
//     let words = userObject.words;

//     let list = words.forEach(async (element) => {
//         let worddetails = await getWordDetailsByWordId(element.word_id);
//         let word = await createAWordFromEkilexData(worddetails);
//         return word;
//     })
//     console.log(list);
//     return list;
// }

module.exports = router;

// maybe another endpoints could be used? There would be less irrelevant data to work with
/*
 https://ekilex.eki.ee/api/meaning/search/profülaktiline
 https://ekilex.eki.ee/api/meaning/details/82513
*/