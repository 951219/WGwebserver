const runningInDevelopement = (process.env.NODE_ENV !== 'production');
if (runningInDevelopement) require('dotenv/config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const engRoutes = require('./routes/eng');
const estRoutes = require('./routes/est');
const userRoutes = require('./routes/user').router;


const server = express();

server.use(body_parser.json());
server.use(morgan('tiny'));
server.use(cors());
server.use('/eng', engRoutes);
server.use('/est', estRoutes);
server.use('/user', userRoutes);


mongoose.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true });
const mongodb = mongoose.connection;
mongodb.on('error', (error) => { console.log(error) });
mongodb.once('open', () => { console.log('Connected to MongoDB!') });

server.listen(process.env.PORT, () => {
    if (runningInDevelopement) {
        console.log(`Server started in development at http://localhost:${process.env.PORT}`)
    }
    else {
        console.log(`Server started in production at port: ${process.env.PORT}`)
    }
}
);

server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
