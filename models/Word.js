const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    definition: {
        type: [String],
        required: true
    },
    example: [String],
    score: {
        type: String,
        default: "0"
    }
})

//'Word' - name of the model in our DB, teine on schema, mis sellega koos on
// module.exports = mongoose.model('eng', wordSchema);
module.exports = mongoose.model('eng', wordSchema);