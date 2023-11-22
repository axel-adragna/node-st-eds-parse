exports.connection = array => {
    return {
        triggerAndTransport: array[0],
        connectionParams: array[1],
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