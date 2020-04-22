module.exports = {
    do: function () {
     
var fs = require('fs');

fs.readFile('wordsOld.txt', 'utf8', function(error, data) {

var lines = data.split('\n');
var words = [];

for(var line = 0; line < lines.length; line++){
    var sLine = lines[line];
    sLine = sLine.split(' /// ');
    
    // console.log(line + "    " + sLine);
    
    const word = {
        id: line,
        tries: sLine[0],
        word: sLine[1],
        definition: sLine[2]
    };

    console.log('Added: ' + word);
    words.push(word);
      }
});

return words;
}
};


// CALL SERVER FAILIST EI TOIMI