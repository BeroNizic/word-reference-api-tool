var wr = require("./wr-api");
//var wr = require("wordreference-api");
var fs = require("fs");

let existingWords = [];
let i = 0;
let wordListFile = "";
let fromLang = "it";
let toLang = "en";
let jsonResultFile = "";

main();

function main() {
  if (!areValidParms()) return;

  jsonResultFile = process.argv[3];
  fromLang = process.argv[4];
  toLang = process.argv[5];
  wordListFile = process.argv[2];

  if (fs.existsSync(jsonResultFile)) {
    fs.readFile(jsonResultFile, "utf8", function (err, data) {
      existingWords = JSON.parse(data);
      callWRAPiForWords();
    });
  } else callWRAPiForWords();
}

function areValidParms() {
  if (process.argv.length != 6) {
    console.error("Usage: wr-api-tool word-list-file json-result-file from-lang to-lang");
    console.log(
      "word-list-file: text file with the list of words. One word per line. For every word will be called word reference API if that word isn't already present in the json-result-file."
    );
    console.log("json-result-file: .json file with the result of word reference API call for every word.");
    console.log("from-lang: original language. For example 'it'");
    console.log("to-lang: in which language to translate. For example 'en'");
    return false;
  }

  let wordListFile = process.argv[2];
  if (!fs.existsSync(wordListFile)) {
    console.error(`${wordListFile} doesn't exist`);
    return false;
  }
  return true;
}

function callWRAPiForWords() {
  fs.readFile(wordListFile, "utf8", function (err, data) {
    var lines = data.split("\r\n");
    lines.forEach((line) => processLine(lines, line));
  });
}

function processLine(lines, line) {
  if (existingWords.find((elem) => elem.initialWord === line || elem.word === line)) {
    console.log(line + " exists");
    i++;
    writeToJsonFileIfNeeded(lines);
    return;
  }

  wr(line, fromLang, toLang).then(
    (result) => {
      result.initialWord = line;
      console.log(result);
      existingWords.push(result);
      i++;
      writeToJsonFileIfNeeded(lines);
    },
    (error) => {
      console.log(error);
      i++;
      writeToJsonFileIfNeeded(lines);
    }
  );
}

function readWordFromWR(word) {
  wr(word, fromLang, toLang).then(
    (result) => {
      console.log(JSON.stringify(result, null, 2));
    },
    (error) => {
      console.log(error);
    }
  );
}

function writeToJsonFileIfNeeded(lines) {
  if (i < lines.length) return;
  var json = JSON.stringify(existingWords, null, 2);
  fs.writeFile(jsonResultFile, json, function (err) {
    if (err) throw err;
    console.log("Successfully written.");
  });
}
