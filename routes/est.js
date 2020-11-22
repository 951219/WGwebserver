const express = require('express');
const router = express.Router();
const Word = require('../models/estWord');




// post to mongo - works
router.post('/', async (req,res)=>{
    const response = await postWord(req.body);
    if(response.added = true){
        res.status(201).json(response.message)
    }else{
        res.status(400).json(response.message)
    }

})

router.get("/:id", async (req, res) => {

    try{
        const item = await Word.findById(req.params.id);
    return res.json(item);
    }
    catch(err){
    return res.status(500).json({message: err.message})
    }

});

// get all from Mongo
router.get('/', async (req,res)=>{
    try{
        const words = await Word.find();
        res.send(words);
    }catch(err){
        res.status(500).json({message: err.message})
    }
})



router.delete("/:id", (req, res) => {
    
        const itemId = req.params.id;
        console.log(itemId);
        Word.remove({
            _id: itemId
        });

        res.json({message: itemId + " deleted"});
  
});

router.delete('/delete/all',async (req,res)=>{
    const response = await deleteDB();
    if(response.deleted = true){
        res.json({message: "DB deleted"})
    }else{
        res.json({message: "Db not deleted"})
    }
});

async function deleteDB(){
    try{
        await Word.remove({});
        return {deleted: true};
    }catch(err){
        return {deleted: false,
        message: err.message}
    }
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
module.exports = router;

