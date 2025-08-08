const {EDSToObj, splitQuotes} = require('./edsToObj');
const EDSTypes  = require('./edsTypes')


exports.ParseEDS = function(str) {
    let eds = EDSToObj(str);

    if(eds.ConnectionManager) {
        Object.keys(eds.ConnectionManager).forEach(item => {
            if (item.slice(0,10) === 'Connection') {
                eds.ConnectionManager[item] = EDSTypes.connection(splitQuotes(eds.ConnectionManager[item], ','));
            }
        });
    }

    if(eds.Params) {
        Object.keys(eds.Params).forEach(item => {
            if (item.slice(0,5) === 'Param') {
                eds.Params[item] = EDSTypes.parameter(splitQuotes(eds.Params[item], ','));
            };
            if (item.slice(0,4) === 'Enum') {
                eds.Params[item] = EDSTypes.enum(splitQuotes(eds.Params[item], ','));
            };
        })
    }
    
    if (eds.Assembly) {
        Object.keys(eds.Assembly).forEach(item => {
            if (item.slice(0,5) === 'Assem') {
                eds.Assembly[item] = EDSTypes.assembly(splitQuotes(eds.Assembly[item], ','));
            }
        });
    }

    if (eds.Groups) {
        Object.keys(eds.Groups).forEach(item => {
            eds.Groups[item] = EDSTypes.group(splitQuotes(eds.Groups[item], ','));
        });
    }

    return eds;
}


exports.GetAssembly = function(eds, n) {
    let assembly = eds.Assembly['Assem'+n.toString()];
    assembly.id = n
    for(let i = 0; i < assembly.params.length; i++) {
        assembly.params[i].name = (assembly.params[i].name === undefined) ? '' : assembly.params[i].name;
        if (assembly.params[i].name.slice(0,5) === 'Param') {
            assembly.params[i].info = {};
            assembly.params[i].info = eds.Params[assembly.params[i].name];
            assembly.params[i].enum = eds.Params['Enum' + assembly.params[i].name.slice(5)]
        } else if (!isNaN(assembly.params[i].name)) {
            assembly.params[i].info = {};
            assembly.params[i].value = Number(assembly.params[i].name)
        } else if (assembly.params[i].name.slice(0,5) === 'Assem') {
            let assem = exports.GetAssembly(eds,assembly.params[i].name.slice(5))
            assembly.params[i].info = assem
        }        
    }
    return assembly;
}

