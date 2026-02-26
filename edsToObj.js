exports.EDSToObj = function(edsString) {
    let obj = {};
    let lineArray = edsString.replace(/\r\n/g,'\n').split("\n");
    lineArray = removeComments(lineArray);
    lineArray = removeSpaces(lineArray);
    lineArray = removeBlankLines(lineArray);
    lineArray = splitQuotes(lineArray.join(''), ';');
    lineArray = removeBlankLines(lineArray);
    lineArray = sepSectionName(lineArray);
    obj = initObj(lineArray);

    return obj;
}

exports.splitQuotes = splitQuotes;

function initObj(lineArray) {
    let obj = {};
    let currentCat = ''
    lineArray.forEach(line => {
        if (line[0] === '[') {
            currentCat = line.slice(1,-1);
            obj[currentCat] = {};
        } else {
            let item = splitQuotes(line, '=')
            obj[currentCat][item[0]] = item[1];
        }
    })

    return obj;
}

function sepSectionName(array) {
    let result = []
    array.forEach(item => {
        // if '[' char is ecountered, a string containing the section header + the following property is expected, for example '[File]DescText=Adapter EDS'.
        // so the section '[File]' and also the property 'DescText' are pushed to the result array.
        if (item[0] === '[') {
            result.push(item.slice(0,item.search("]") + 1));
            result.push(item.slice(item.search("]") + 1))
        } else {
            result.push(item)
        }
    })

    return result;
}

function splitQuotes(str, sep) {
    const stripQuotes = s => (s.startsWith('"') && s.endsWith('"')) ? s.slice(1, -1) : s;

    const array = [];
    let item = "";
    let inQuotes = false;

    // this crazy char-by-char parsing is needed:
    // if the separator is encountered and the double quote is closed, ends the parsing of the current element.
    // this is needed in order to continue parsing a quoted property if the separator is encountered in between.
    // example: HelpString of a Param object can be: "foo, bar, baz" with ',' separator.
    for (let i = 0; i < str.length; i++) {
        const currentChar = str[i];

        if (currentChar === '"') {
            inQuotes = !inQuotes;
            item += currentChar;
        }
        else if (currentChar === sep && !inQuotes) {
            array.push(stripQuotes(item));
            item = "";
        }
        else {
            item += currentChar;
        }
    }

    if (item.length > 0)
        array.push(stripQuotes(item));

    return array;
}

function removeSpaces(lines) {
    return lines.map(line => line.replace(/([^"]+)|("[^"]+")/g, (x,y,z) => {return (y) ? y.replace(/\s/g, '') : z})) 
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
