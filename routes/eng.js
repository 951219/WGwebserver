const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Word = require('../models/engWord');


//WORDNIK

//Get by word from Wordnik
router.get('/getbyword/:word',async (req,res)=>{
    const url = `https://api.wordnik.com/v4/word.json/${req.params.word}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=${process.env.WORDNIK_API_KEY}`;
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    //TODO filter out unnecessary information(1st element for example)
    //TODO check against my own db, if present, send from my db instead of wordnik
});

//Get specified amount of random words from Wordnik
router.get('/random/:howmany',async (req,res)=>{
    var number = req.params.howmany;
    if(number==0) number = 1;
    const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=${number}&api_key=${process.env.WORDNIK_API_KEY}`
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    
});

//Get 1 random from Wordnik
router.get('/random',async (req,res)=>{
    const url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=1&api_key=${process.env.WORDNIK_API_KEY}`
    const fetch_response = await fetch(url);
    const json = await fetch_response.json();
    res.json(json);
    
});

// #############################


//Post to mongo 
router.post('/', async (req,res)=>{
    const response = await postWord(req.body);
    if(response.added = true){
        res.status(201).json(response.message)
    }else{
        res.status(400).json(response.message)
    }
});

router.get("/:id", getWord, async(req, res) => {
    res.json(res.word);
});


//Only for updating score
router.patch("/:id", getWord, async (req, res)=>{
    if(req.body.score != null){ 
        res.word.score = req.body.score
    }

    try{
        const updatedWord = await res.word.save();
        res.json(updatedWord);
    }catch(err){
        res.status(400).json({message: err.message});
    }
})

// get all from Mongo
router.get('/', async(req,res)=>{
    try{
        const words = await Word.find();
        res.send(words);
    }catch(err){
        res.status(500).json({message: err.message})
    }
})


router.delete("/:id", getWord, async (req, res) => {
    try{
        await res.word.remove();
        res.json({message: "Word deleted"})
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

//Get random from Mongo

//Get with higher score from Mongo

//delete all from collection
// router.delete('/delete/all',async (req,res)=>{
//     const response = await deleteCollection();
//     if(response.deleted = true){
//         res.json({message: "DB deleted"})
//     }else{
//         res.json({message: "Db not deleted"})
//     }
// });


//Functions 
async function getWord(req, res, next){
    let word;
    try{
        word = await Word.findById(req.params.id);
        if(word == null){
            return res.status(404).json({message: "Cannot find the word"});
        }
    } catch(err){
    return res.status(500).json({message: err.message});
    }
    res.word = word;
    next();
}

async function postWord(data){
    const newWord = new Word({
        word: data.word,
        definition: data.definition,
        example: data.example,
        score: data.score
    });

    try{
        const postingWord = await newWord.save();
        console.log(postingWord);
        return {
            added: true,
            message: postingWord};
    }catch(err){
        return {
            added: false,
            message: "could not save it"};
    }
}

// async function deleteCollection(){
//     try{
//         await Word.remove({});
//         return {deleted: true};
//     }catch(err){
//         return {deleted: false,
//         message: err.message}
//     }
// }



module.exports = router;