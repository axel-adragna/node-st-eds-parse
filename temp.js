let EdsParse = require('./index');
let fs = require('fs');
let eds = EdsParse.ParseEDS(fs.readFileSync('test-eds/ifm_IOL_Master_AL1322.eds').toString());

console.log(eds, EdsParse.GetAssembly(eds, 199).params);