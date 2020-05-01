const express = require('express');
const server = express();

const body_parser = require('body-parser')
server.use(body_parser.json());

const db = require('diskdb');
db.connect('./data', ['words']);
// The syntax is: db.connect('/path/to/db-folder', ['collection-name']);


// add json route handler
// server.get("/json", (req, res) => {
//     res.json({
//         message: "Hello world"
//     });
// });

// add html route handler
server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// server.get("/info", (req, res) => {
//     res.sendFile(__dirname + '/info.html');
// });

//start server 
const port = process.env.PORT;
server.listen(port || 4000, () => {
    console.log(`Server listening at ${port} or at 4000`);
});


// CRUD / REST / DISKDBga suhtlus
server.get("/words", (req, res) => {
    res.json(db.words.find());
});

server.get("/words/:id", (req, res) => {
    const reqId = req.params.id;
    const items = db.words.find({
        id: reqId
    })

    if (items.length) {
        console.log('\nViewing word with an id of ' + reqId + "\nobject: " + JSON.stringify(items));
        res.json(items);
    } else {
        console.log(`item ${reqId} doesn't exist`);

        res.json({
            message: `item ${reqId} doesn't exist`
        })
    }
});

server.post("/words", (req, res) => {
    const item = req.body;
    console.log('Adding new word: ', item)

    db.words.save(item);

    res.json(db.words.find());
})

server.put("/words/:id", (req, res) => {
    const itemId = req.params.id;
    const item = req.body;
    console.log("Editing words: ", itemId, " to be ", item);

    db.words.update({
        id: itemId
    }, item);

    res.json(db.words.find({
        id: itemId
    }));
});

server.delete("/words/:id", (req, res) => {
    const itemId = req.params.id;
    console.log("Delete word with id: ", itemId);

    db.words.remove({
        id: itemId
    });

    res.json(db.words.find());
});

server.get("/words/random/:number", (req, res) => {
    const randNumber = req.params.number;

    var randItems = new Array();

    for (var i = 0; i < randNumber; i++) {

        //TODO check if duplicate

        const numb = getRandomInt(getDBlength());

        const item = db.words.find({
            id: numb.toString()
        })

        if (item.length) {
            console.log(`loop ${i} -  Adding word with an id of ` + numb);
            //+ "\nobject: " + JSON.stringify(item)
            randItems.push(item);
        } else {
            console.log(`loop ${i} - item ${numb} doesn't exist`);
        }
    }

    res.json(randItems);
});

function getRandomInt(max) {
    return Math.floor(
        Math.random() * (max + 1)
    )
}

function getDBlength() {
    return db.words.find().length;
}


//testdata juhuks kui db tyhi
if (!db.words.find().length) {

    var fs = require('fs');

    fs.readFile('wordsOld.txt', 'utf8', function (error, data) {

        var lines = data.split('\n');

        for (var line = 0; line < lines.length; line++) {
            var sLine = lines[line];
            sLine = sLine.split(' /// ');

            const word = {
                id: line.toString(),
                tries: sLine[0],
                word: sLine[1],
                definition: sLine[2]
            };

            console.log(word);

            db.words.save(word);
        }
    });
}

//TODO Is the word already in the db function?
//TODO take from EKI / oxford dict etc