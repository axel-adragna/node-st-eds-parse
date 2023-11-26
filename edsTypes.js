exports.connection = array => {
    return {
        triggerAndTransport: parseInt(array[0]),
        connectionParams: parseInt(array[1]),
        OTrpi: array[2],
        OTsize: array[3],
        OTformat: array[4],
        TOrpi: array[5],
        TOsize: array[6],
        TOformat: array[7],
        proxyConfigSize: array[8],
        proxyConfigFormat: array[9],
        targetConfigSize: array[10],
        targetConfigFormat: array[11],
        connectionName: array[12],
        helpString: array[13],
        path: array[14]
    }
}

exports.parameter = array => {
    return {
        linkSize: array[1],
        linkPath: array[2],
        descriptor: parseInt(array[3]),
        dataType: parseInt(array[4]),
        dataSize: parseInt(array[5]),
        name: array[6],
        units: array[7],
        helpString: array[8],
        minValue: parseInt(array[9]),
        maxValue: parseInt(array[10]),
        defaultValue: parseInt(array[11]),
        scalingMult: array[12],
        scalingDiv: array[13],
        scalingBase: array[14],
        linksMult: array[15],
        linksDiv: array[16],
        linksBase: array[17],
        linksOffset: array[18],
        decimalPlaces: parseInt(array[19])
    }
}

exports.enum = array => {
    let result = [];
    for (let i = 0; i < array.length; i+=2) {
        result.push({
            value: parseInt(array[i]),
            name: array[i+1]
        });
    }
    return result;
}

exports.assembly = array => {
    let params = [];
    for(let i = 6; i < array.length; i+=2) {
        params.push({
            name: array[i+1],
            size: parseInt(array[i])
        })
    }
    return {
        name: array[0],
        path: array[1],
        size: parseInt(array[2]),
        descriptor: parseInt(array[3]),
        params: params
    }
}