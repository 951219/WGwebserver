const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    pw_hash: {
        type: String,
        required: true
    },
    words: [
        {
            word_id: {
                type: Number,
                required: true
            },
            lang: {
                type: String,
                required: true
            },
            word: {
                type: String,
                required: true
            },
            score: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('userModel', userModel);