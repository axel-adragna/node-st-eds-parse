const fs = require('fs');

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
        let item = line.split('=')
        if (typeof item[1] === 'string' && item[1][0] === '"' && item[1][item[1]-1] === '"') item[1] = item[1].slice(1,-1)
        eds[category][item[0]] = item[1];
        eds[category][item[0]] = parameter(item[0],eds[category][item[0]])
    }
});

console.log(eds,getConfigData(eds, 1),getConfigData(eds, 1).configInstance.data.toString('hex'))

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

function removeSpaces(str) {
    return str.replace(/([^"]+)|("[^"]+")/g, (x,y,z) => {return (y) ? y.replace(/\s/g, '') : z})
}

function removeBlankLines (a) {
 return a.filter(line => line.trim().length !== 0);
}

function removeComments (lines) {
    let commentPosition = str => {
        let quotes = 0
        let position = -1
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '"') quotes++;
            if (str[i] === '$' && !(quotes % 2)) {
                position = i;
                break;
            }
        }
        return position;
    }
    
    return lines.map(line => {
        let newLine = line.trim()
        let cp = commentPosition(newLine)
        if (cp > -1) {
            newLine = newLine.slice(0,cp)
        }
        return newLine.trim()
    })
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