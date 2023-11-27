const {EDSToObj, splitQuotes} = require('./edsToObj');
const EDSTypes  = require('./edsTypes')


exports.ParseEDS = function(str) {
    let eds = EDSToObj(str);

    if(eds.ConnectionManager) {
        Object.keys(eds.ConnectionManager).forEach(item => {
            if (item.slice(0,10) === 'Connection') {
                eds.ConnectionManager[item] = EDSTypes.connection(splitQuotes(eds.ConnectionManager[item], ','))
            }
        });
    }

    if(eds.Params) {
        Object.keys(eds.Params).forEach(item => {
            if (item.slice(0,5) === 'Param') {
                eds.Params[item] = EDSTypes.parameter(splitQuotes(eds.Params[item], ','))
            };
            if (item.slice(0,4) === 'Enum') {
                eds.Params[item] = EDSTypes.enum(splitQuotes(eds.Params[item], ','))
            };
        })
    }
    
    if (eds.Assembly) {
        Object.keys(eds.Assembly).forEach(item => {
            if (item.slice(0,5) === 'Assem') {
                eds.Assembly[item] = EDSTypes.assembly(splitQuotes(eds.Assembly[item], ','))
            }
        });
    }
    

    return eds;
}


exports.GetAssembly = function(eds, n) {
    let assembly = eds.Assembly['Assem'+n.toString()];
    assembly.id = n
    for(let i = 0; i < assembly.params.length; i++) {
        assembly.params[i].info = {};
        if (assembly.params[i].name) {
            assembly.params[i].info = eds.Params[assembly.params[i].name];
            assembly.params[i].enum = eds.Params['Enum' + assembly.params[i].name.slice(5)]
        }
    }
    return assembly;
}






/** 


const fs = require('fs');
const {edsToObj, splitQuotes} = require('./edsToObj'); 
const EdsTypes  = require('./edsTypes')

//let eds = edsToObj(fs.readFileSync('test-eds/00010003012C0100.eds').toString())
let eds = edsToObj(fs.readFileSync('test-eds/ifm_IOL_Master_AL1322.eds').toString())

Object.keys(eds.ConnectionManager).forEach(item => {
    if (item.slice(0,10) === 'Connection') {
        eds.ConnectionManager[item] = EdsTypes.connection(splitQuotes(eds.ConnectionManager[item], ','))
    }
});

Object.keys(eds.Params).forEach(item => {
    if (item.slice(0,5) === 'Param') {
        eds.Params[item] = EdsTypes.parameter(splitQuotes(eds.Params[item], ','))
    };
    if (item.slice(0,4) === 'Enum') {
        eds.Params[item] = EdsTypes.enum(splitQuotes(eds.Params[item], ','))
    };
})

Object.keys(eds.Assembly).forEach(item => {
    if (item.slice(0,5) === 'Assem') {
        eds.Assembly[item] = EdsTypes.assembly(splitQuotes(eds.Assembly[item], ','))
    }
});

let eds = {};
let array = fs.readFileSync('test-eds/00010003012C0100.eds').toString().replace(/\r\n/g,'\n').split("\n");

let stage1 = removeBlankLines(removeComments(array)).map(line =>{return removeSpaces(line)});
let stage2 = ((stage1.join('')[stage1.join('').length-1] === ';') ? stage1.join('').slice(0,-1) : stage1.join('')).split(";");
let stage3 = []

stage2.forEach(line => {
    let newLine = line;
    if(newLine[0] === ',') newLine = newLine.slice(1);
    if (newLine[0] === '[') {
        stage3.push(newLine.slice(0,newLine.search("]") + 1))
        newLine = newLine.slice(newLine.search("]") + 1)
    }
    if(newLine[0] === ',') newLine = newLine.slice(1);
    stage3.push(newLine);
})


let category = ""
stage3.forEach(line => {
    if (line[0] === '[') {
        category = line.slice(1,line.search(']'));
        eds[category] = {};
    } else {
        let item = splitQuotes(line, '=')
        if (typeof item[1] === 'string' && item[1][0] === '"' && item[1][item[1]-1] === '"') item[1] = item[1].slice(1,-1)
        eds[category][item[0]] = item[1];
        eds[category][item[0]] = parameter(item[0],eds[category][item[0]])
    }
});

console.log(eds,getConfigData(eds, 15))

console.log(splitQuotes('$Jason " IS $ " a StuD $ "Fudge$" $', '$'))

function parameter(p, v) {
    if (typeof p === 'string' && p.slice(0,5) === 'Param') {
        let preInfo = v.split(',')
        let info = preInfo.map(item => (typeof item === 'string' && item[0] === '"') ? item.slice(1,-1) : item)
        return {
            link: {
                size: info[1],
                path: info[2]
            },
            descriptor: info[3],
            dataType: info[4],
            dataSize: parseInt(info[5]),
            name: info[6],
            units: info[7],
            helpString: info[8],
            dataValues: {
                min: parseInt(info[9]),
                max: parseInt(info[10]),
                default: parseInt(info[11])
            },
            scaling: {
                multi: info[12],
                div: info[13],
                base: info[14],
                offset: info[15]
            },
            links: {
                multi: info[16],
                div: info[17],
                base: info[18],
                offset: info[19]
            },
            decimalPlaces: parseInt(info[20])
        }
    } else {
        return v
    }
}


function getConfigData(eds, conn) {
    let configType = 9
    if (eds.ConnectionManager['Connection'+conn.toString()].split(',')[11].length > 1) configType = 11;
    let config = {
        configInstance: {
            assembly: parseInt(eds.ConnectionManager['Connection'+conn.toString()].split(',')[configType].slice(5)),
            size: parseInt(eds.Assembly[eds.ConnectionManager['Connection'+conn.toString()].split(',')[configType]].split(',')[2])
        },
        outputInstance: {
            assembly: parseInt(eds.ConnectionManager['Connection'+conn.toString()].split(',')[4].slice(5)),
            size: parseInt(eds.Assembly[eds.ConnectionManager['Connection'+conn.toString()].split(',')[4]].split(',')[2])
        },
        inputInstance: {
            assembly: parseInt(eds.ConnectionManager['Connection'+conn.toString()].split(',')[7].slice(5)),
            size: parseInt(eds.Assembly[eds.ConnectionManager['Connection'+conn.toString()].split(',')[7]].split(',')[2])
        }
    }

    let configAssembly = eds.Assembly['Assem' + config.configInstance.assembly.toString()].split(',')
    let buf = Buffer.alloc(parseInt(configAssembly[2]))

    let offset = 0
    for(let i=6; i < configAssembly.length; i+=2) {
            switch (configAssembly[i]) {
                case '8':
                    if (eds.Params[configAssembly[i+1]]) buf.writeInt8(parseInt(eds.Params[configAssembly[i+1]].dataValues.default),offset);
                    offset+=1;
                    break;
                case '16':
                    if (eds.Params[configAssembly[i+1]]) buf.writeInt16LE(parseInt(eds.Params[configAssembly[i+1]].dataValues.default),offset);
                    offset+=2;
                    break;
                case '32':
                    if (eds.Params[configAssembly[i+1]]) buf.writeInt32LE(parseInt(eds.Params[configAssembly[i+1]].dataValues.default),offset);
                    offset+=4;
                    break;
            } 
    }

    config.configInstance.data = buf
    return config;
}
*/