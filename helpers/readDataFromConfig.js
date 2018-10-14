const fs = require('fs');
const path = require('path');

module.exports = (callback) => {
    const rawData = fs.readFileSync(path.join(__dirname,'..','config','network.txt'),{encoding: "UTF8"});
    const rawDataParts = rawData.split('\n');

    callback({
        ip: rawDataParts[0],
        apelido: rawDataParts[1],
        tempo: Number.parseInt(rawDataParts[2])
    })
}