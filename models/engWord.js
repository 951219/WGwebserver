const mongoose = require('mongoose');

const engWordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    meaning: {
        type: [String],
        required: true
    },
    example: [String],
    timeAdded: {
        type: Date,
        required: true,
    },
    wordId: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('engWord', engWordSchema);