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




for (var numb =0; numb<5; numb++) {
var wordFromDB = db.words.findOne({
    index: numb.toString()
});

const newWord = new Word({
    word: wordFromDB['word'],
    definition: wordFromDB['definition'],
    example: wordFromDB['example']
});

postit(newWord);
    

}

async function postit(word) {
    try{
        const postingWord = await word.save();
        console.log(postingWord);
    }catch(err){
        console.log({message: err.message});
    }
}

//TODO not working