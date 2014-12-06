var express = require('express');
var router = express.Router();
var Markov = require('markov');
var _ = require('underscore');

var markov = Markov();

var loadSongs = require('../loadSongs');

loadSongs(function(res) {
  res.forEach(function(s) {
    markov.seed(s);
  });
});

function syllables (word) {
  word = word.toLowerCase();
  if(word.length <= 3) { return 1; }

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  return word.match(/[aeiouy]{1,2}/g).length;
}

function terribleEnding(w) {
  // not just articles, but whatever
  var articles = [
    'the',
    'of',
    'so',
    'a',
    'where',
    'i\'ll',
  ];

  return articles.indexOf(w) > -1;
}

function lineEnding(w) {
  var endings = [';',',','.','!','?', '', '', '', ''];
  var noEnding = [
    'your',
    'my',
    'to',
    'where',
  ]

  if (noEnding.indexOf(w) > -1) {
    return w;
  }

  return w + endings[parseInt(Math.random() * endings.length)];
}

function getLyrics() {
  var lines = [];
  var lyrics = [];
  var line = [];
  var verseLength = 4;

  var syllablesPerLine = parseInt(Math.random() * 6) + 6;
  var syllableCount = 0;

  var limit = (parseInt(Math.random() * 4) + 4) * (syllablesPerLine);

  var words = markov.respond(markov.pick(), limit).join(' ');
  words = words.split(/[.,!;:? ]/gi);

  words = words.map(function(w) {
    w = w.replace(/[",.]/, '');

    return {
      word: w,
      syllables: syllables(w)
    }
  });

  words.forEach(function(w) {
    // Don't end a line on "the", etc
    if (syllableCount + w.syllables >= syllablesPerLine &&
                terribleEnding(w.word)) {
      w.word = null;
    }

    if (w.word) {
      if (syllableCount === 0) {
        w.word = w.word.charAt(0).toUpperCase() + w.word.substring(1)
      } else {
        w.word = w.word.toLowerCase();
      }

      line.push(w.word.toLowerCase());
      syllableCount += w.syllables;

      if (syllableCount >= syllablesPerLine) {
        line[line.length - 1] = lineEnding(line[line.length - 1]);
        lyrics.push(line.join(' '));
        line = [];
        syllableCount = 0;
      }
    }
  });

  lyrics = _.flatten(lyrics);

  var chorusLength = lyrics.length % 4;
  var chorus = [];

  if (chorusLength > 0) {
    for (var i = 0; i < lyrics.length % 4; i++) {
      var line = parseInt(Math.random() * lyrics.length);
      chorus.push(lyrics[line]);
      delete lyrics[line];
    }
  }

  var chorusedLyrics = ['\n[VERSE]'];
  var counter = 0;

  lyrics.forEach(function(l, i) {
    if (
      counter > 0 && 
      counter % 4 === 0 && 
      chorus.length > 0
    ) {
      chorusedLyrics.push('\n[CHORUS]');
      chorusedLyrics = chorusedLyrics.concat(chorus);
      chorusedLyrics.push('\n[VERSE]');
    }

    chorusedLyrics.push(l);
    counter++;

    if (counter > 4) {
      counter = 1;
    }
  });

  return chorusedLyrics;
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express',
    lyrics: getLyrics(),
  });
});

module.exports = router;
