function loadSongs (cb) {
  var fs = require('fs');
  var songs = [];

  fs.readdir(__dirname + '/../data', function(err, files) {
    var counter = 0;

    function returnSongs () {
      if (counter === files.length) {
        cb(songs);
      }
    }

    var files = files.filter(function(file) { 
      return file.substr(-4) === '.txt';
    });

    files.forEach(function(file) {
      fs.readFile(__dirname + '/../data/' + file, 'utf-8', function(err, contents) {
        counter++;

        if (!err) {
          songs.push(contents);
        }

        returnSongs();
      }); 
    });
  });

  function inspectFile(contents) {
    if (contents.indexOf('data-template="home"') != -1) {
      // do something
    }
  }
}

module.exports = loadSongs;
