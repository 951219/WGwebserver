//16.08 routsid mujale kausta routes/posts.jms
const express = require('express');
const router = express.Router();
const Word = require('../models/Word');

//gets all of the entries
router.get('/', async (req,res) =>{
    try{
    const posts = await Word.find();
    res.json(posts);
    }catch(err){
        res.json({message:err})
    }
});


//adds an entry
router.post('/',async(req,res)=>{
    const post = new Word({
        word: req.body.word,
        definition: req.body.definition
    });

    try {const savedWord = await post.save();
    res.json(savedWord);
    }catch(err){
        res.json(err);
    }
});

//get back specific entry
router.get('/:wordId',async (req,res)=>{
  try{ const word= await Word.findById(req.params.wordId);
    res.json(word);
}catch(err){
    res.json({message:err});
}
});

//delete specific entry
router.delete('/:wordId',async (req,res)=>{
    try{ 
        const removedWord= await Word.remove({_id: req.params.wordId});
      res.json(removedWord);
  }catch(err){
      res.json({message:err});
  }
  })


//update an entry
router.patch('/:wordId',async (req,res)=>{
    try{ 
      const updatedPost = await Word.updateOne(
          {_id: req.params.wordId},
          {$set:{ word: req.body.word}});
      
      res.json(updatedPost);
  }catch(err){
      res.json({message:err});
  }
  })


module.exports = router;