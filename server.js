const express = require('express');
const server = express();

const body_parser = require('body-parser')
server.use(body_parser.json());

const db = require('diskdb');
db.connect('./data', ['movies']);
// The syntax is: db.connect('/path/to/db-folder', ['collection-name']);

// add json route handler
server.get("/json", (req, res) => {
    res.json({
        message: "Hello world"
    });
});

//add html route handler
server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.get("/info", (req, res) => {
    res.sendFile(__dirname + '/info.html');
});

//start server 

const port = 4000;

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});


// CRUD / REST / DISKDB

server.get("/items", (req, res) => {
    res.json(db.movies.find());
});

server.get("/items/:id", (req, res) => {
    const itemId = req.params.id;
    const items = db.movies.find({ id: itemId });
    if (items.length) {
       res.json(items);
    } else {
       res.json({ message: `item ${itemId} doesn't exist` })
    }
 });


server.post("/items", (req, res) => {
    const item = req.body;
    console.log('Adding new item: ', item)

    db.movies.save(item);

    res.json(db.movies.find());
})


//TODO put not working in postman - edit: id urli l6ppu
server.put("/items/:id", (req, res) => {
    const itemId = req.params.id;
    const item = req.body;
    console.log("Editing item: ", itemId, " to be ", item);
 
    db.movies.update({ id: itemId }, item);
 
    res.json(db.movies.find({ id: itemId }));
 });

 //works with "curl -X PUT -H "Content-Type: application/json" --data '{"name": "banana vaarikaga"}' http://localhost:4000/items/3"


server.delete("/items/:id", (req, res) => {
    const itemId = req.params.id;
    console.log("Delete item with id: ", itemId);

    db.movies.remove({
        id: itemId
    });

    res.json(db.movies.find());
});





//testdata juhuks kui db tyhi
if (!db.movies.find().length) {
    const movie = {
        id: "tt0110358",
        name: "The Tiger King",
        genre: "animation"
    };
    db.movies.save(movie);
}
console.log(db.movies.find());


//kuuenda juures pooleli. https://dev.to/lenmorld/quick-database-with-node-express-and-diskdb-in-5-minutes-1jjj
