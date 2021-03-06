const extract = require('extract-json-from-string');
const util = require('util');
const fs = require('fs');
const es = require('event-stream');

const regex = /\d{3} \d{3}/;
const regexChar = /[a-zA-Z0-9_.-=|]*/;
const regexJsonStr = /{(?:[^{}])*}/;

var totalLines = 0;
var str = '';
var result = [];
var resultTokens = [];
const resultText = [];
const resultJson = [];
var s = fs.createReadStream('../android_bitwarden_dump1.log')
          .pipe(es.split())
          .pipe(
            es.mapSync(function(line) {
                totalLines++;
                str += line;
                if (totalLines % 1000 === 0) {
                  // console.log(`lines: ${str}`);
                  result.push(extract(str));
                  const match = regex.exec(str);
                  match && resultTokens.push(match[0]);
                  const matchChar = regexChar.exec(str);
                  matchChar && resultText.push(matchChar[0]);
                  const matchJson = regexJsonStr.exec(str);
                  matchJson && resultJson.push(matchJson[0]);
                  str = '';
                }
            })
            .on('end', function() {
                console.log(`Read entire file`);
                fs.writeFileSync('../output.json', JSON.stringify(result, null, 2), 'utf-8');
                fs.writeFileSync('../token.txt', resultTokens.join('\n'), 'utf-8');
                fs.writeFileSync('../output.txt', resultText.join('\n'), 'utf-8');
                fs.writeFileSync('../outputJsonStr.txt', resultJson.join('\n'), 'utf-8');
                console.log(totalLines);
            })
          )

