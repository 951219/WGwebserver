// take all of the words fron the DiskDB
// add them to Mongo one by one
const db = require('diskdb');
const Word = require('./models/word');


db.connect('./data', ['words']);
// console.log(db.words.find());
console.log(db.words.count());

// db.words.find().forEach(element => {
//     console.log(element['word']);
// });





var wordFromDB = db.words.findOne({
    index: "6"
});

const newWord = new Word({
    word: wordFromDB['word'],
    definition: wordFromDB['definition'],
    example: wordFromDB['example']
});
try{
    const postingWord = await newWord.save();
    res.status(201).json(postingWord);
}catch(err){
    res.status(400).json({message: err.message})
}



//TODO not working