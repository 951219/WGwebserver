const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/engWord');
const { authorizeUser } = require('./user');
const crypto = require('crypto');

// TODO fetch to axios if implementing a new API

const logger = require('pino')({
    prettyPrint: {
        levelFirst: true
    },
    prettifier: require('pino-pretty')
});


//TODO posttouserDB() if it is not there yet, same as in est.js

//Get by word from Wordnik
// router.get('/getbyword/:word', authorizeUser, async (req, res) => {
//     const url = `https://api.wordnik.com/v4/word.json/${req.params.word}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=${process.env.WORDNIK_API_KEY}`;
//     const fetch_response = await fetch(url);
//     const json = await fetch_response.json();
//     res.json(json);
//     //TODO filter out unnecessary information(1st element for example)
//     //TODO check against my own db, if present, send from my db instead of wordnik
// });

//Get specified amount of random words from Wordnik
// router.get('/random/:howmany', authorizeUser, async (req, res) => {
//     var number = req.params.howmany;
//     if (number == 0) number = 1;
//     const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=${number}&api_key=${process.env.WORDNIK_API_KEY}`
//     const fetch_response = await fetch(url);
//     const json = await fetch_response.json();
//     res.json(json);

// });

//Get 1 random from Wordnik
// router.get('/random', authorizeUser, async (req, res) => {
//     const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=1&api_key=${process.env.WORDNIK_API_KEY}`
//     const fetch_response = await fetch(url);
//     const json = await fetch_response.json();
//     res.json(json);

// });

// #############################


//Post to mongo 
// router.post('/', authorizeUser, async (req, res) => {
//     const response = await postWord(req.body);
//     if (response.added = true) {
//         res.status(201).json(response.message);
//     } else {
//         res.status(400).json(response.message);
//     }
// });

router.get("/:word", getWord, async (req, res) => {
    res.json(res.word);
});


//Only for updating score
router.patch("/:id", authorizeUser, getWord, async (req, res) => {
    if (req.body.score != null) {
        res.word.score = req.body.score;
    }

    try {
        const updatedWord = await res.word.save();
        res.json(updatedWord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// get all from Mongo
router.get('/', authorizeUser, async (req, res) => {
    try {
        const words = await Word.find();
        res.send(words);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//Functions 
async function getWord(req, res, next) {
    let requestedWord = req.params.word;
    let responseWord;
    try {
        responseWord = await Word.findOne({
            word: requestedWord
        });
        if (responseWord == null) {
            logger.warn(`Cannot find the word ${requestedWord} from ENG DB`);
            let owlbotWord = await searchOwlbotForAWord(requestedWord);
            if (!owlbotWord.hasOwnProperty('message')) {
                let completedWord = await createAWordFromOwlbotData(owlbotWord);
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
                return res.status(500).json({ message: `no word found for ${requestedWord}` });
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

async function searchOwlbotForAWord(queryWord) {
    logger.info(`Querying owlbot for word ${queryWord}`);
    const url = `https://owlbot.info/api/v4/dictionary/${encodeURI(queryWord)}`;
    // TODO fetch to axios
    try {
        const fetch_response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Token ${process.env.OWLBOT_API_KEY}` } }).catch((err) => {
            logger.warn(`No such word found: ${queryWord}`);
            return {
                message: `No such word found: ${queryWord}`,
                error: err.message
            };
        });

        const json = await fetch_response.json();

        if (json.hasOwnProperty('word')) {
            logger.info(`Success -> searchOwlbotForAWord() -> found the word ${queryWord}`);
            return json;

        } else {
            logger.warn(`Failure -> searchOwlbotForAWord() -> No word returned for ${queryWord}`);
            return { message: `No such word found: ${queryWord}` };
        }
    } catch (err) {
        logger.error(err.message);
        return { message: err.message };
    }

}

async function createAWordFromOwlbotData(data) {
    let word = data.word;
    let definitions = [];
    let examples = [];

    data.definitions.forEach(element => {
        if (element.definition != null) {
            if (!definitions.includes(element.definition)) {
                definitions.push(element.definition);
            }
        }

        if (element.example != null) {
            if (!examples.includes(element.example)) {
                examples.push(element.example);
            }
        }
    });
    return { word, definitions, examples };
}

async function postWordToDB(data) {
    let id = crypto.randomBytes(16).toString('hex');
    const newWord = new Word({
        word: data.word,
        meaning: data.definitions,
        example: data.examples,
        timeAdded: Date.now(),
        wordId: id

    });

    try {
        const postingWord = await newWord.save();
        logger.info(`Word ${postingWord.word} posted to DB`);
    } catch (err) {
        logger.error(`Failure -> postWordToDB() -> Word ${postingWord.word} was not added to DB\n ${err.message}`);
    }
}

module.exports = router;