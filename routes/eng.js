const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/word');

const db = require('diskdb');
// const https = require('https');

//get back specific word with different definitions using https package
// router.get('/:word',async (req,res)=>{
//     const url = `https://api.wordnik.com/v4/word.json/${req.params.word}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=${process.env.WORDNIK_API_KEY}`;
//     const request = await https.get(url, (resp) => {
//     let data = '';
//     resp.on('data', (chunk) => {
//         data += chunk;
//     });
//     resp.on('end', () => {
//     res.json(JSON.parse(data));
//     });
//     }).on("error", (err) => {
//     console.log("Error: " + err.message);
//     });
// });


//Get by word from wordnik
router.get('/getbyword/:word',async (req,res)=>{
    const url = `https://api.wordnik.com/v4/word.json/${req.params.word}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=${process.env.WORDNIK_API_KEY}`;
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    //TODO filter out unnecessary information(1st element for example)
    //TODO check against my own db, if present, send from my db instead of wordnik
});


//Get specified amount of random words
router.get('/random/:howmany',async (req,res)=>{
    var number = req.params.howmany;
    if(number==0) number = 1;
    const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=${number}&api_key=${process.env.WORDNIK_API_KEY}`
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    
});

router.get('/random',async (req,res)=>{
    const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=1&api_key=${process.env.WORDNIK_API_KEY}`
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    
});


//get all from MOngo
// router.get('/', async(req,res)=>{
//     try{
//         const words = await Word.find();
//         res.send(words);
//     }catch(err){
//         res.status(500).json({message: err.message})
//     }
// })



//post to mongo - works
router.post('/', async (req,res)=>{


    const newWord = new Word({
        word: req.body.word,
        definition: req.body.definition,
        example: req.body.example,
        score: req.body.score
    });


    try{
        const postingWord = await newWord.save();
        res.status(201).json(postingWord);
    }catch(err){
        res.status(400).json({message: err.message})
    }
})



module.exports = router;