const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    words: [
        {
            wordId: {
                type: Number,
                required: true
            },
            lang: {
                type: [String],
                required: true
            },
            word: {
                type: [String],
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