//16.08 routsid mujale kausta routes/posts.jms
const express = require('express');
const router = express.Router();
const https = require('https');
const fetch = require('node-fetch');

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
});



router.get('/random/:howmany',async (req,res)=>{
    var number = req.params.howmany;
    if(number==0){
        number = 1;
    }
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

module.exports = router;