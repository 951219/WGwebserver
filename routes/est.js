const express = require('express');
const router = express.Router();
const Word = require('../models/word');
const db = require('diskdb');
db.connect('./data', ['words']);

router.get('/updatefromolddb', async (req,res)=>{

    // var wordFromDB = db.words.find();
    var list = [];
    
    for(var i =0;i<5;i++){
        
        const wordFromDB = db.words.findOne({
            index: i.toString()
        })
    
        const newWord = new Word({
            word: wordFromDB['word'],
            definition: wordFromDB['definition'],
            example: wordFromDB['example']
        });

        try{
            await newWord.save();
            // res.status(201).json(postingWord);
        }catch(err){

            res.status(400).json({message: err.message})
        }
    }
    res.status(201);
})

module.exports = router;

//TODO works but shitty