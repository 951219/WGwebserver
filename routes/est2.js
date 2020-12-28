const express = require('express');
const router = express.Router();
const Word = require('../models/estWord');
const fetch = require('node-fetch');

router.post('/', async (req, res) => {
    const response = await postWord(req.body);
    if (response.added = true) {
        res.status(201).json(response.message)
    } else {
        res.status(400).json(response.message)
    }
})

router.get("/:id", getWord, (req, res) => {
    res.json(res.word);
});

router.get("/:id", getWord, (req, res) => {
    res.json(res.word);
});

//Only for updating score
router.patch("/:id", getWord, async (req, res) => {
    if (req.body.score != null) {
        res.word.score = req.body.score
    }

    try {
        const updatedWord = await res.word.save();
        res.json(updatedWord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

//Get all
router.get('/', async (req, res) => {
    try {
        const words = await Word.find();
        res.send(words);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete("/:id", getWord, async (req, res) => {
    try {
        await res.word.remove();
        res.json({ message: "Word deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// router.delete('/delete/all',async (req,res)=>{
//     const response = await deleteDB();
//     if(response.deleted = true){
//         res.json({message: "DB deleted"})
//     }else{
//         res.json({message: "Db not deleted"})
//     }
// });

async function getWord(req, res, next) {
    let word;
    try {
        word = await Word.findById(req.params.id);
        if (word == null) {
            return res.status(404).json({ message: "Cannot find the word" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.word = word;
    next();
}

// async function deleteDB(){
//     try{
//         await Word.remove({});
//         return {deleted: true};
//     }catch(err){
//         return {deleted: false,
//         message: err.message}
//     }
// }

async function postWord(data) {
    const newWord = new Word({
        word: data.word,
        definition: data.definition,
        example: data.example,
        score: data.score
    });

    try {
        const postingWord = await newWord.save();
        console.log(postingWord);
        return {
            added: true,
            message: postingWord
        };
    } catch (err) {
        return {
            added: false,
            message: "could not save it"
        };
    }
}


// TODO getByWord from DB

// server.get("/words/scrapefromeki/:word", async (req, res) => {
//     // TODO: ATM pulling from DB twice, needs refactoring so maybe it would redirect the client to endpoint that pulls from db
//     // TODO: scraping works locally, not in heroku

//     var word = req.params.word;

//     if (isAlreadyinDB(word)) {
//         var wordFromDB = db.words.find({
//             word: word
//         });

//         res.json({
//             message: 'from DB',
//             wordFromDB
//         })
//     } else {

//         var scrapedWord = await scrapers.scrapeWordFromEKI(word);

//         res.json({
//             message: 'from EKI',
//             scrapedWord
//         });
//     }
// });

//Get by word from Wordnik
router.get('/ekilex/:word', async (req, res) => {
    // const meta = {
    //     'Content-Type': 'text/xml',

    // };
    // const headers = new Headers(meta);


    const url = `https://ekilex.eki.ee/api/word/search/${req.params.word}/sss`;
    console.log(url);
    const fetch_response = await fetch(url, { method: 'GET', headers: { 'ekilex-api-key': process.env.EKILEX_API_KEY } });
    const json = await fetch_response.json();
    res.json(json);




    // fetch('https://httpbin.org/post',)
    //     .then(res => res.json())
    //     .then(json => console.log(json));
});

module.exports = router;

//TODO pulling from ekilex
/*
Returns word id by Word from EKI API - https://ekilex.eki.ee/api/word/search/{word}/sss  - sss - EKI sõnastik 2020
Returns definitions by word it from EKI API - https://ekilex.eki.ee/api/word/details/{wordID}

ekilex-api-key as a header is necessary for both

*/